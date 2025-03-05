import logging
from fastapi import FastAPI, HTTPException, Form, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from management import AppManagement
from responses import ResponseHandler

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
manager = AppManagement("model")  
response_handler = ResponseHandler()

class PredictionInput:
    def __init__(self, token: Optional[str] = Form(None), file: UploadFile = File(...)):
        self.token = token
        self.file = file

@app.post("/detection/detect/")
async def predict(input_data: PredictionInput = Depends()):
    try:
        prediction_data = await manager.get_prediction(
            token=input_data.token,
            input_image=input_data.file
        )
        return response_handler.handle_response(
            message=response_handler.MESSAGES.get("PREDICTION_SUCCESS"),
            response=prediction_data
        )
    except HTTPException as e:
        return response_handler.handle_response(status_code=e.status_code, error=str(e.detail))
    except Exception as e:
        logger.error(f"Unexpected error in prediction endpoint: {e}")
        return response_handler.handle_exception(exception=e)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
