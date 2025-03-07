from fastapi import FastAPI, Form, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import your management module
try:
    from management import AppManagement
    from responses import ResponseHandler
except ImportError as e:
    logger.critical(f"Failed to import required modules: {e}")
    sys.exit(1)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    manager = AppManagement()
except Exception as e:
    logger.critical(f"Failed to initialize AppManagement: {e}")
    sys.exit(1)

response_handler = ResponseHandler()

@app.post("/detection/detect/")
async def predict(
    file: UploadFile = File(...),
    token: Optional[str] = Form(None)
):
    try:
        return await manager.get_prediction(
            token=token,
            input_image=file
        )
    except Exception as e:
        logger.error(f"Error on prediction view: {str(e)}")
        return response_handler.handle_exception(
            exception=f"Error on prediction view: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)