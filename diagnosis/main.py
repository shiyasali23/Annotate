from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from pydantic import BaseModel
from typing import Dict, Union, Optional
import logging
import sys



logger = logging.getLogger(__name__)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from management import AppManagement
    from responses import ResponseHandler
except ImportError as e:
    logger.critical(f"Failed to import required modules: {e}")
    sys.exit(1)

try:
    app_manager = AppManagement()
except Exception as e:
    logger.critical(f"Failed to initialize AppManagement: {e}")
    sys.exit(1)

response_handler = ResponseHandler()

class PredictionInput(BaseModel):
    data: Dict[str, Union[str, int, float]]
    token: Optional[str] = None

@app.post("/diagnosis/predict/{model_id}")
async def predict(model_id: str, input_data: PredictionInput):
    try:
        return await app_manager.get_prediction(
            model_id=model_id, 
            data=input_data.data,
            token=input_data.token
        )
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error in prediction endpoint: {e}")

@app.get("/diagnosis/get_features/{pk}")
async def get_features(pk: str):
    try:
        if pk not in ["diagnosis_model", "disease_detections"]:
            raise HTTPException(status_code=400, detail="Invalid parameter value")
        is_diagnosis = (pk == "diagnosis_model")
        return await app_manager.get_features(is_diagnosis)
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error in features endpoint: {e}")

@app.get("/diagnosis/metadata")
async def get_metadata():
    try:
        return await app_manager.get_all_metadata()
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error in metadata view: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)