from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import numpy as np
import os
import joblib
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
models_directory = "models"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

class ModelManager:
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self.loaded_models = {}
        self.model_metadata = {}
        self.success_response = {'error': None, 'status': 200, 'message': 'Success'}
        self.error_response = {'response': None, 'error': "Something went wrong", 'status': 500, 'message': 'Request failed'}
        self._load_models()

    def _load_models(self):
        for filename in os.listdir(self.models_dir):
            if filename.endswith('.pkl'):
                self._load_model(filename)

    def _load_model(self, filename: str):
        try:
            model_data = joblib.load(os.path.join(self.models_dir, filename))
            metadata = model_data.get('metadata', {})
            model = model_data.get('model', None)
            
            if not model or not metadata:
                raise ValueError("Invalid model data")
            model_id = metadata.get('id')
            
            if model and model_id:
                self.loaded_models[model_id] = model
                self.model_metadata[model_id] = metadata
                logger.info(f"Loaded model with id: {model_id}")
        
        except Exception as e:
            logger.error(f"Error loading model {filename}: {e}")
            raise RuntimeError(f"Error loading model {filename}")

    def _validate_input(self, data: Dict[str, str], model_id: str) -> np.array:
        try:
            if not data:
                raise ValueError("Input data is required")

            metadata = self.model_metadata.get(model_id, {})
            feature_names = metadata.get('feature_names')
            feature_maps = metadata.get('feature_maps', {})

            # Convert JSON strings to Python objects if necessary
            if isinstance(feature_names, str):
                feature_names = json.loads(feature_names)
            if isinstance(feature_maps, str):
                feature_maps = json.loads(feature_maps)

            if not feature_names:
                raise ValueError("Feature names not found in model metadata")

            missing_features = [name for name in feature_names if name not in data]
            if missing_features:
                raise ValueError(f"Missing required feature(s): {missing_features}")

            processed_values = []
            for feature in feature_names:
                data_value = data[feature]
                
                if feature in feature_maps:
                    mapping = feature_maps[feature]
                    if data_value not in mapping:
                        raise ValueError(f"Invalid value '{data_value}' for feature '{feature}'. Valid options: {list(mapping.keys())}")
                    processed_value = mapping[data_value]
                else:
                    try:
                        processed_value = float(data_value)
                    except ValueError:
                        raise ValueError(f"Invalid numeric value '{data_value}' for feature '{feature}'")
                
                processed_values.append(processed_value)

            return np.array(processed_values).astype(float)

        except ValueError as e:
            logger.error(f"Input validation error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected validation error: {e}")
            raise HTTPException(status_code=500, detail="Input processing failed")

    def get_prediction(self, model_id: str, data: Dict[str, str]) -> dict:
        try:
            validated_input = self._validate_input(data, model_id)
            
            model = self.loaded_models.get(model_id)

            if not model:
                logger.error(f"Model {model_id} not found")
                raise HTTPException(status_code=404, detail="Model not found")

            prediction = model.predict([validated_input])[0]
            if hasattr(model, "decision_function"):
                decision_scores = model.decision_function([validated_input])
                exp_scores = np.exp(decision_scores - np.max(decision_scores))
                probabilities = (exp_scores / np.sum(exp_scores))[0].tolist()
            elif hasattr(model, "predict_proba"):
                probabilities = model.predict_proba([validated_input])[0].tolist()
            else:
                probabilities = []

            return self._align_prediction(model_id, prediction, probabilities)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    def _align_prediction(self, model_id: str, prediction: int, probabilities: list) -> dict:
        try:
            metadata = self.model_metadata.get(model_id, {})
            output_map = metadata.get('output_maps', {})

            if isinstance(output_map, str):
                output_map = json.loads(output_map)

            reverse_map = {v: k for k, v in output_map.items()}
            mapped_prediction = reverse_map.get(prediction, "Unknown")
            
            class_probabilities = {}
            if probabilities:
                class_probabilities = {
                    class_label: round(prob * 100, 2)
                    for class_label, prob in zip(output_map.keys(), probabilities)
                }

            return {
                'prediction': mapped_prediction,
                'probabilities': class_probabilities
            }

        except Exception as e:
            logger.error(f"Prediction alignment error: {e}")
            raise HTTPException(status_code=500, detail="Result processing error")

    def get_features(self, is_diagnosis: bool) -> list:
        try:
            target_id = "tdsevgg53h5f53e6"
            return [
                {
                    **{k: meta.get(k) for k in ['id', 'name',  'accuracy', 'feature_category', 'feature_names', 'output_maps', 'feature_maps']},
                    'max_feature_impact': max(
                        json.loads(meta.get('feature_impacts', '{}')).items(),
                        key=lambda item: item[1], default=("", [])[0])[0]
                    if 'feature_impacts' in meta else None
                }
                for meta in self.model_metadata.values()
                if (is_diagnosis and meta.get('id') == target_id) or (not is_diagnosis and meta.get('id') != target_id)
            ]
        except Exception as e:
            logger.error(f"Feature retrieval error: {e}")
            raise HTTPException(status_code=500, detail="Feature processing error")


    def get_all_metadata(self) -> list:
        try:
            return list(self.model_metadata.values())
        except Exception as e:
            logger.error(f"Metadata retrieval error: {e}")
            raise HTTPException(status_code=500, detail="Metadata processing error")

manager = ModelManager(models_directory)

class PredictionInput(BaseModel):
    data: Dict[str, str]

@app.post("/predict/{model_id}")
async def predict(model_id: str, input_data: PredictionInput):
    try:
        prediction_data = await run_in_threadpool(manager.get_prediction, model_id, input_data.data)
        response = manager.success_response.copy()
        response.update({
            'message': 'Prediction successful',
            'response': prediction_data
        })
        return JSONResponse(content=response, status_code=200)
    except HTTPException as e:
        return JSONResponse(
            content={'error': str(e.detail), 'status': e.status_code, 'message': 'Request failed'},
            status_code=e.status_code
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JSONResponse(
            content=manager.error_response,
            status_code=500
        )

@app.get("/get_features/{pk}")
async def get_features(pk: str):
    try:
        if pk not in ["diagnosis", "disease_detections"]:
            raise ValueError("Invalid parameter value")
        is_diagnosis = pk == "diagnosis"
        features = await run_in_threadpool(manager.get_features, is_diagnosis)
        response = manager.success_response.copy()
        response.update({
            'message': 'Features retrieved successfully',
            'response': features
        })
        return JSONResponse(content=response, status_code=200)
    except HTTPException as e:
        return JSONResponse(
            content={'error': str(e.detail), 'status': e.status_code, 'message': 'Request failed'},
            status_code=e.status_code
        )
    except Exception as e:
        logger.error(f"Feature endpoint error: {e}")
        return JSONResponse(
            content=manager.error_response,
            status_code=500
        )

@app.get("/metadata")
async def metadata():
    try:
        metadata_list = await run_in_threadpool(manager.get_all_metadata)
        response = manager.success_response.copy()
        response.update({
            'message': 'Metadata retrieved successfully',
            'response': metadata_list
        })
        return JSONResponse(content=response, status_code=200)
    except HTTPException as e:
        return JSONResponse(
            content={'error': str(e.detail), 'status': e.status_code, 'message': 'Request failed'},
            status_code=e.status_code
        )
    except Exception as e:
        logger.error(f"Metadata endpoint error: {e}")
        return JSONResponse(
            content=manager.error_response,
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)