import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool
from typing import Dict, Union

from management import AppManagement
from responses import ResponseHandler

logger = logging.getLogger(__name__)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
models_dir = "models"  # Adjust as needed
manager = AppManagement(models_dir)
response_handler = ResponseHandler()

class PredictionInput(BaseModel):
    data: Dict[str, Union[str, int, float]]

@app.post("/diagnosis/predict/{model_id}")
async def predict(model_id: str, input_data: PredictionInput):
    try:
        prediction_data = await run_in_threadpool(manager.get_prediction, model_id, input_data.data)
        return response_handler.handle_response(
            message=response_handler.MESSAGES.get("PREDICTION_SUCCESS"),
            response=prediction_data
        )
    except HTTPException as e:
        return response_handler.handle_response(status_code=e.status_code, error=str(e.detail))
    except Exception as e:
        logger.error(f"Unexpected error in prediction endpoint: {e}")
        return response_handler.handle_exception(exception=e)

@app.get("/diagnosis/get_features/{pk}")
async def get_features(pk: str):
    try:
        if pk not in ["diagnosis_model", "disease_detections"]:
            raise HTTPException(status_code=400, detail="Invalid parameter value")
        is_diagnosis = (pk == "diagnosis_model")
        features = await run_in_threadpool(manager.get_features, is_diagnosis)
        return response_handler.handle_response(
            message=response_handler.MESSAGES.get("FEATURES_RETRIEVED"),
            response=features
        )
    except HTTPException as e:
        return response_handler.handle_response(status_code=e.status_code, error=str(e.detail))
    except Exception as e:
        logger.error(f"Unexpected error in features endpoint: {e}")
        return response_handler.handle_exception(exception=e)

@app.get("/diagnosis/metadata")
async def get_metadata():
    try:
        metadata_list = await run_in_threadpool(manager.get_all_metadata)
        return response_handler.handle_response(
            message=response_handler.MESSAGES.get("METADATA_RETRIEVED"),
            response=metadata_list
        )
    except HTTPException as e:
        return response_handler.handle_response(status_code=e.status_code, error=str(e.detail))
    except Exception as e:
        logger.error(f"Unexpected error in metadata endpoint: {e}")
        return response_handler.handle_exception(exception=e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
