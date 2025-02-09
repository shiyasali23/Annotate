import os
import joblib
import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
from typing import List
import warnings
import cv2
from ultralytics import YOLO

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Load models
models = {}
base_model_dir = './models'  

models = {}
base_model_dir = './models'

model_files = {
    'diabetes': 'diabetis_predictor.pkl',
    'liver_condition': 'liver_condition_predictor.pkl',
    'disease': 'disease_predictor.pkl',
}

# Load models
for model_name, model_filename in model_files.items():
    try:
        model_path = os.path.join(base_model_dir, model_filename)
        models[model_name] = joblib.load(model_path)
        logger.info(f"{model_name} model loaded successfully from {model_path}.")
    except Exception as e:
        logger.error(f"Failed to load {model_name} model: {e}")
        raise RuntimeError(f"Failed to load model: {e}")




class DataInput(BaseModel):
    data: List[float]
    
    


@app.post(f"/predict/{models['diabetes']['metadata']['id']}", status_code=200)
def predict_diabetes(data: DiabetesInput):
    try:
        input_data = np.array(data.data).reshape(1, -1)
        prediction = models['diabetes']['model'].predict(input_data)
        probabilities = models['diabetes']['model'].predict_proba(input_data)

        return {
            "prediction": int(prediction[0]),  
            'probabilities': probabilities[0].tolist()  
        }

    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(status_code=422, detail=f"Value error: {e}")

@app.post(f"/predict/{models['liver_condition']['metadata']['id']}", status_code=200)
def predict_liver_condition(data: LiverConditionInput):
    try:
        input_data = np.array(data.data).reshape(1, -1)
        prediction = models['liver_condition']['model'].predict(input_data)
        probabilities = models['liver_condition']['model'].predict_proba(input_data)

        return {
            "prediction": int(prediction[0]),  
            'probabilities': probabilities[0].tolist()  
        }

    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(status_code=422, detail=f"Value error: {e}")

@app.post(f"/predict/{models['disease']['metadata']['id']}", status_code=200)
def predict_disease(data: DiseaseInput):
    try:
        input_data = np.array(data.data).reshape(1, -1)
        prediction = models['disease']['model'].predict(input_data)
        scores = models['disease']['model'].decision_function(input_data)
        exp_scores = np.exp(scores - np.max(scores))
        probabilities = exp_scores / np.sum(exp_scores)

        return {
            "prediction": int(prediction[0]),  
            'probabilities': probabilities[0].tolist()  
        }

    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(status_code=422, detail=f"Value error: {e}")



    
    
@app.get("/register_models/", status_code=200)
def register_models():
    models_metadata = []
    for model_name, model in models.items():
        try:
            metadata = model.get('metadata', {})
            model_data = {
                'id': metadata.get('id', None),
                'name': metadata.get('name', None),
                'version': metadata.get('version', None),
                'algorithm': metadata.get('algorithm', None),
                'framework': metadata.get('framework', None),
                'accuracy': metadata.get('accuracy', None),
                'precision': metadata.get('precision', None),
                'recall': metadata.get('recall', None),
                'feature_names': metadata.get('feature_names', None),
                'feature_impacts': metadata.get('feature_impacts', None),
                'feature_maps': metadata.get('feature_maps', None),
                'output_maps': metadata.get('output_maps', None),
                'hyperparameters': metadata.get('hyperparameters', None)
            }
            models_metadata.append(model_data)
        except Exception as e:
            logger.error(f"Failed to process model {model_name}: {e}")
            raise HTTPException(status_code=422, detail=f"Value error: {e}")

    return models_metadata