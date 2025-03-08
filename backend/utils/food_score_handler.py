import numpy as np
import logging

from django.utils import timezone
from datetime import timedelta


from utils.objects_handler import ObjectsHandler
from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler

from webapp.serializers import BiometricsEntrySerializer,BiometricsSerializer

logger = logging.getLogger(__name__)

objects_handler = ObjectsHandler()
response_handler = ResponseHandler()
user_handler = UserHandler()

class FoodScoreHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.male_biochemicals_data = []
        self.female_biochemicals_data = []
        self.biochemicals_validity_data = []
        self.healthy = False
        self._load_food_wieghts()

    def _load_food_wieghts(self):
        try:
            biochemicals, error = objects_handler.get_biochemicals(is_response=False)       
            if error:
                return
            for bio in biochemicals:
                self.male_biochemicals_data.extend([bio["male_min"], bio["male_max"]])
                self.female_biochemicals_data.extend([bio["female_min"], bio["female_max"]])
                self.biochemicals_validity_data.append(bio["validity_days"])
            
            if all([self.male_biochemicals_data, self.female_biochemicals_data, self.biochemicals_validity_data]):
                self.healthy = True
            
        except Exception as e:
            logger.error(f"Error loading biochemicals: {e}")
            
    def create_food_scores(self, user):
        return response_handler.handle_response(
            response="hi"
        )
    
    def get_food_scores(self, user):
        return response_handler.handle_response(
            response="hi"
        )
                       
    

            

