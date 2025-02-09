from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import numpy as np
import os
import joblib
import logging



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


class Management:
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self.models = {}
        self.metadatas = {}
        self.success_response = {'error': None, 'status': 200, 'message': 'Success'}
        self.error_response = {'response': None, 'error': "Something went wrong", 'status': 500, 'message': 'Request failed'}
        self.load_models()

    def load_models(self):
        for filename in os.listdir(self.models_dir):
            if filename.endswith('.pkl'):
                self.load_model(filename)

    def load_model(self, filename):
        try:
            model_data = joblib.load(os.path.join(self.models_dir, filename))
            metadata = model_data.get('metadata', {})
            model = model_data.get('model', None)
            model_id = metadata.get('id')
            if model and model_id:
                self.models[model_id] = model
                self.metadatas[model_id] = metadata
                logger.info(f"Loaded model with id: {model_id}")
        except Exception as e:
            logger.error(f"Error loading model {filename}: {e}")
            raise SystemExit("Critical error: Invalid model data.")

    def get_prediction(self, model_id: str, data: List[float]) -> dict:
        model = self.models.get(model_id)
        if not model:
            raise ValueError(f"Model {model_id} not found")
        input_data = np.array(data).reshape(1, -1)
        prediction = model.predict(input_data)[0]
        prediction_data = {"prediction": int(prediction)}
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_data)[0].tolist()
        else:
            probabilities = []
        prediction_data['probabilities'] = probabilities
        return prediction_data

    def get_features(self, is_diagnosis: bool) -> list:
        target_id = "tdsevgg53h5f53e6"
        return [
            {k: meta.get(k) for k in ['name', 'accuracy', 'feature_names', 'output_maps' ,'id']}
            for meta in self.metadatas.values()
            if (is_diagnosis and meta.get('id') == target_id) or (not is_diagnosis and meta.get('id') != target_id)
        ]

    def get_metadata(self) -> list:
        return list(self.metadatas.values())

manager = Management(models_directory)


class DataInput(BaseModel):
    data: List[float]

@app.post("/predict/{model_id}")
async def predict(model_id: str, input_data: DataInput):
    prediction_data = await run_in_threadpool(manager.get_prediction, model_id, input_data.data)
    success_response = {
        **manager.success_response,
        'message': 'Prediction successful',
        'response': prediction_data
    }
    return JSONResponse(content=success_response, status_code=200)

@app.get("/get_features/{pk}")
async def get_features(pk: str):
    if pk not in ["diagnosis", "disease_detections"]:
        raise ValueError("Invalid value for pk. Expected 'diagnosis' or 'disease_detections'.")
    is_diagnosis = pk == "diagnosis"
    features = await run_in_threadpool(manager.get_features, is_diagnosis)
    success_response = {
        **manager.success_response,
        'message': 'Features fetched successfully',
        'response': features
    }
    return JSONResponse(content=success_response, status_code=200)

@app.get("/metadata")
async def metadata():
    metadata_list = await run_in_threadpool(manager.get_metadata)
    success_response = {
        **manager.success_response,
        'message': 'Metadata fetched successfully',
        'response': metadata_list
    }
    return JSONResponse(content=success_response, status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)