import os
import logging
import json
import numpy as np
import cv2
import httpx
import sys
from ultralytics import YOLO
from fastapi import UploadFile

from responses import ResponseHandler

logger = logging.getLogger(__name__)
response_handler = ResponseHandler()

class AppManagement:
    def __init__(self):
        self.models_dir = "model"
        self.loaded_model = None
        self.BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000/backend')
        try:
            self._load_model()
        except Exception as e:
            print(f"FATAL ERROR: {e}")
            logger.critical(f"FATAL ERROR during model loading: {e}")
            sys.exit(1)  # Exit with error code 1

    def _load_model(self):
        try:
            model_files = [f for f in os.listdir(self.models_dir) if f.endswith('.pt')]

            if not model_files:
                raise FileNotFoundError(f"No model found in the directory {self.models_dir}")
            
            model_path = os.path.join(self.models_dir, model_files[0])
            self.loaded_model = YOLO(model_path)
            logger.info(f"Detection model loaded successfully")
        except FileNotFoundError as e:
            logger.error(f"Model loading failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error loading detection model: {e}")
            raise RuntimeError(f"Failed to load detection model: {e}")

    async def get_prediction(self, token: str = None, input_image: UploadFile = None):
        try:
            print(f"Input image received: {input_image}")
        
            if input_image is None:
                print("Input image is None")
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_IMAGE"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"]
                )
            
            image_bytes = await input_image.read()
            
            if len(image_bytes) == 0:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_IMAGE"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"],
                    status_code=400
                )
                
            np_image = np.frombuffer(image_bytes, np.uint8)
            
            preprocessed_image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
            if preprocessed_image is None:
                return response_handler.handle_exception(
                    exception=f"NumPy array shape after frombuffer: {np_image.shape}"
                )
            
            results = self.loaded_model(preprocessed_image)

            detected_items = set()
            for result in results:
                for box in result.boxes:
                    name = self.loaded_model.names[int(box.cls)]
                    confidence = box.conf.item()  
                    if confidence > 0.5:
                        detected_items.add(name)

            if detected_items:
                await self._register_prediction(token, detected_items)
                return response_handler.handle_response(
                    response=detected_items
                )
            else:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES["NO_DETECTION"],
                    message=response_handler.MESSAGES["REQUEST_FAILED"]
                )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error while predicting : {str(e)}"
            )

    async def _register_prediction(self, token: str, detected_items: set):
        try:
            payload = {"token": token, "predictions": list(detected_items)}
            logger.info(f"Sending prediction data to {self.BACKEND_URL}/register_prediction: {payload}")

            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.BACKEND_URL}/register_prediction", json=payload)
                logger.info(f"Response status: {response.status_code}, Response body: {response.text}")

        except Exception as e:
            logger.error(f"Error sending prediction data: {e}")