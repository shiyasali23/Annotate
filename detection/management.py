import os
import json
import logging
import joblib
import numpy as np
import cv2
from ultralytics import YOLO
from fastapi import HTTPException, UploadFile

logger = logging.getLogger(__name__)

class AppManagement:
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self.loaded_model = None
        self._load_model()

    def _load_model(self):
        try:
            model_files = [f for f in os.listdir(self.models_dir) if f.endswith('.nt')]
            if not model_files:
                raise FileNotFoundError(f"No model found in the directory {self.models_dir}")
            
            model_path = os.path.join(self.models_dir, model_files[0])
            self.loaded_model = YOLO(model_path)
            logger.info(f"Detection model loaded successfully: {model_files[0]}")
        except FileNotFoundError as e:
            logger.error(f"Model loading failed: {e}")
            raise       
        except Exception as e:
            logger.error(f"Unexpected error loading detection model: {e}")
            raise RuntimeError(f"Failed to load detection model: {e}")
        
    async def get_prediction(self, token: str = None, input_image: UploadFile = None):
        try:
            image_bytes = await input_image.read()
            np_image = np.frombuffer(image_bytes, np.uint8)
            preprocessed_image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
            
            results = self.loaded_model(preprocessed_image)
            detected_items = set()
            for result in results:
                for detection in result.boxes:
                    name = self.loaded_model.names[int(detection.cls)]
                    confidence = detection.conf
                    if confidence > 0.5:
                        detected_items.add(name)
            return list(detected_items)
        except Exception as e:
            logger.error(f"Unexpected error in prediction endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
