import joblib
import os
import numpy as np
import sys
import logging

from typing import Dict, Union, Optional

import asyncio
import httpx
import json

from responses import ResponseHandler

logger = logging.getLogger(__name__)
response_handler = ResponseHandler()

class AppManagement:
    def __init__(self):
        self.models_dir = "models"
        self.loaded_models = {}
        self.model_metadata = {}
        self.BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000/backend')
        try:
            self._load_models()
        except Exception as e:
            print(f"FATAL ERROR: {e}")
            logger.critical(f"FATAL ERROR during model loading: {e}")
            sys.exit(1)  

        
        
    def _load_models(self):
        try:
            for filename in os.listdir(self.models_dir):
                if filename.endswith('.pkl'):
                    self._load_model(filename)
        except FileNotFoundError as e:
            logger.error(f"Model loading failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error loading models: {e}")
            raise RuntimeError(f"Failed to loading models: {e}")

    def _load_model(self, filename: str):
        try:
            model_data = joblib.load(os.path.join(self.models_dir, filename))
            metadata = model_data.get('metadata', {})
            model = model_data.get('model', None)
            if not model or not metadata:
                raise ValueError("Invalid model data")
            model_id = metadata.get('id')
            if model_id:
                self.loaded_models[model_id] = model
                self.model_metadata[model_id] = metadata
                logger.info(f"Loaded model with id: {model_id}")
        except Exception as e:
            logger.error(f"Error loading model {filename}: {e}")
            raise RuntimeError(f"Error loading model {filename}")

    def _validate_input(self, data: Dict[str, Union[str, int, float]], model_id: str) -> np.array:
        if not data:
            return response_handler.handle_response(
                status_code=400,
                error=["INVALID_DATA"]
            )
        
        metadata = self.model_metadata.get(model_id, {})
        feature_names = metadata.get('feature_names')
        feature_maps = metadata.get('feature_maps', {})

        if isinstance(feature_names, str):
            feature_names = json.loads(feature_names)
        if isinstance(feature_maps, str):
            feature_maps = json.loads(feature_maps)

        if not feature_names:
            return response_handler.handle_exception(
                exception="Feature names not found in metadata"
            )

        missing = [name for name in feature_names if name not in data]
        if missing:
            return response_handler.handle_response(
                status_code=400,
                error=f"Missing required features: {missing}"
            )

        processed = []
        for feature in feature_names:
            value = data[feature]
            if feature in feature_maps:
                mapping = feature_maps[feature]
                if value not in mapping:
                    return response_handler.handle_response(
                        status_code=400,
                        error=f"Invalid value '{value}' for feature '{feature}'. Valid: {list(mapping.keys())}"
                    )
                processed.append(mapping[value])
            else:
                try:
                    processed.append(float(value))
                except ValueError:
                    return response_handler.handle_response(
                        status_code=400,
                        error=f"Invalid numeric value '{value}' for feature '{feature}'"
                    )
        return np.array(processed, dtype=float)

    async def get_prediction(self, model_id: str, data: Dict[str, Union[str, int, float]], token: Optional[str]) -> dict:
        try:
            validated = self._validate_input(data, model_id)

            # If validated input is not a numpy array, it's an error response so return it immediately.
            if not isinstance(validated, np.ndarray):
                return validated

            model = self.loaded_models.get(model_id)
            if not model:
                return response_handler.handle_response(
                    status_code=400,
                    error=f"Model with id {model_id} not found"
                )


            prediction = model.predict([validated])[0]

            if hasattr(model, "decision_function"):
                scores = model.decision_function([validated])

                exp_scores = np.exp(scores - np.max(scores))
                probabilities = (exp_scores / np.sum(exp_scores))[0].tolist()
            elif hasattr(model, "predict_proba"):
                probabilities = model.predict_proba([validated])[0].tolist()
            else:
                probabilities = []
            
            return await self._align_prediction(
                model_id=model_id,
                prediction=prediction,
                probabilities=probabilities,
                token=token
            )
        
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error while predicting: {str(e)}"
            )

    async def _align_prediction(self, model_id: str, prediction: int, probabilities: list, token: Optional[str]) -> dict:
        try:
            metadata = self.model_metadata.get(model_id, {})
            output_map = metadata.get('output_maps', {})
            if isinstance(output_map, str):
                output_map = json.loads(output_map)
            reverse = {v: k for k, v in output_map.items()}
            mapped_predictions = reverse.get(prediction, "Unknown")
            class_probs = {}
            
            if probabilities:
                class_probs = {k: round(prob * 100, 2) for k, prob in zip(output_map.keys(), probabilities)}
            
            response_data = {
                "prediction": mapped_predictions,
                "probabilities": class_probs
            }
            
            if token:
                asyncio.create_task(self._register_prediction(
                    token=token,
                    response_data=response_data,
                    model_id=model_id
                ))
            
            return response_handler.handle_response(response=response_data)
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error while aligning prediction: {str(e)}"
            )

    async def get_features(self, is_diagnosis: bool) -> list:
        target_id = "tdsevgg53h5f53e6"
        try:
            features = [
                {
                    **{k: meta.get(k) for k in ['id', 'name', 'accuracy', 'feature_category', 'feature_names', 'output_maps', 'feature_maps']},
                    'max_feature_impact': max(
                        json.loads(meta.get('feature_impacts', '{}')).items(),
                        key=lambda item: item[1],
                        default=("", 0)
                    )[0] if 'feature_impacts' in meta else None
                }
                for meta in self.model_metadata.values()
                if (is_diagnosis and meta.get('id') == target_id) or (not is_diagnosis and meta.get('id') != target_id)
            ]
            return response_handler.handle_response(response=features)
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error in feature retrieval: {e}"
            )

    async def get_all_metadata(self) -> list:
        try:
            return response_handler.handle_response(response=list(self.model_metadata.values()))
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error in metadata retrieval: {e}"
            )
    
    async def _register_prediction(self, token: str, response_data: dict, model_id: str):
        try:
            payload = {"token": token, "predictions": response_data, 'model_id': model_id}
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.BACKEND_URL}/register_prediction", json=payload)
                logger.info(f"Response: {response.status_code}")

        except Exception as e:
            logger.error(f"Error sending prediction data: {e}")