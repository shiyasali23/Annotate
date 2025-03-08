import numpy as np
import logging

from django.utils import timezone
from datetime import timedelta

from adminpanel.serializers import FoodWeightSerializer, NutrientWeightSerializer, FoodNutrient, Food
from adminpanel.models import FoodWeight, NutrientWeight

from utils.objects_handler import ObjectsHandler
from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler

logger = logging.getLogger(__name__)

objects_handler = ObjectsHandler()
response_handler = ResponseHandler()
user_handler = UserHandler()


class FoodScoreHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            try:
                cls._instance._init_once()
            except Exception as e:
                logger.error(f"Failed to initialize FoodScoreHandler: {e}")
                raise
        return cls._instance

    def _init_once(self):
        self.foods_bias_matrix = None
        self.foods_weights_matrix = None
        self.nutrients_bias_matrix = None
        self.nutrients_weights_matrix = None
        
        self.normalized_nutrients_matrix = None
        self.normalized_food_nutriscore_matrix = None
        
        self.healthy = False
        self._load_food_nutrients_weights()
        self._load_normalized_nutrients_nutriscores()

    def _load_food_nutrients_weights(self):
        try:
            # Load FoodWeight objects
            foods_weights_result = objects_handler.get_all_objects(
                model=FoodWeight,
                serializer_class=FoodWeightSerializer,
                prefetch_related_fields=['biochemical', 'food']
            )
            if not foods_weights_result[0]:
                raise Exception("Fetching food weights failed.")

            foods_bias_matrix, foods_weights_matrix = self._create_food_nutrient_matrix(
                weight_bias_array=foods_weights_result[0],
                is_food=True
            )
            if foods_bias_matrix.size == 0 or foods_weights_matrix.size == 0:
                raise Exception("Creating food matrix failed.")
            self.foods_bias_matrix = foods_bias_matrix
            self.foods_weights_matrix = foods_weights_matrix

            # Load NutrientWeight objects
            nutrients_weights_result = objects_handler.get_all_objects(
                model=NutrientWeight,
                serializer_class=NutrientWeightSerializer,
                prefetch_related_fields=['biochemical', 'nutrient']
            )
            if not nutrients_weights_result[0]:
                raise Exception("Fetching nutrient weights failed.")

            nutrients_bias_matrix, nutrients_weights_matrix = self._create_food_nutrient_matrix(
                weight_bias_array=nutrients_weights_result[0],
                is_food=False
            )
            if nutrients_bias_matrix.size == 0 or nutrients_weights_matrix.size == 0:
                raise Exception("Creating nutrient matrix failed.")
            self.nutrients_bias_matrix = nutrients_bias_matrix
            self.nutrients_weights_matrix = nutrients_weights_matrix  

        except Exception as e:
            logger.error(f"Error loading food nutrient weights/bias: {e}")
            raise
        
    def _load_normalized_nutrients_nutriscores(self):
        try:
            normalized_nutrients = FoodNutrient.objects.values('nutrient__id', 'normalized_value')
            if not normalized_nutrients or len(normalized_nutrients) == 0:
                raise Exception("Fetching normalized nutrients failed.")
            
            normalized_nutrients_matrix = self._create_nutrients_nutriscore_matrix(normalized_nutrients)
            if normalized_nutrients_matrix.size == 0:
                raise Exception("Creating normalized nutrients matrix failed.")
            self.normalized_nutrients_matrix = normalized_nutrients_matrix
            
            normalized_food_nutriscore = Food.objects.values('id', 'normalized_nutriscore')
            if not normalized_food_nutriscore or len(normalized_food_nutriscore) == 0:
                raise Exception("Fetching normalized food nutriscore failed.")
            
            normalized_food_nutriscore_matrix = self._create_nutrients_nutriscore_matrix(normalized_food_nutriscore)
            if normalized_food_nutriscore_matrix.size == 0:
                raise Exception("Creating normalized food nutriscore matrix failed.")
            self.normalized_food_nutriscore_matrix = normalized_food_nutriscore_matrix
        
        except Exception as e:
            logger.error(f"Error loading normalized nutrients/nutriscore: {e}")

    def _create_food_nutrient_matrix(self, weight_bias_array, is_food=True):
        try:
            # Extract the item identifier (food or nutrient), bias, weight, and biochemical data.
            items = np.array([item['food'] if is_food else item['nutrient'] for item in weight_bias_array])
            biases = np.array([item["bias"] for item in weight_bias_array])
            weights = np.array([item["weight"] for item in weight_bias_array])
            biochemicals = np.array([item["biochemical"] for item in weight_bias_array])

            # Compute unique items and biochemical identifiers and get their inverse indices.
            unique_items, items_idx = np.unique(items, return_inverse=True)
            unique_biochemicals, biochemical_idx = np.unique(biochemicals, return_inverse=True)

            # Pre-allocate matrices.
            bias_matrix = np.zeros((len(unique_items), len(unique_biochemicals)), dtype=np.float32)
            weight_matrix = np.zeros((len(unique_items), len(unique_biochemicals)), dtype=np.float32)

            # Populate the matrices using vectorized advanced indexing.
            bias_matrix[items_idx, biochemical_idx] = biases
            weight_matrix[items_idx, biochemical_idx] = weights

            return bias_matrix, weight_matrix

        except Exception as e:
            logger.error(f"Error creating food nutrient matrix: {e}")
            raise
        
    def _create_nutrients_nutriscore_matrix(self, data_array):
        try:
            keys = list(data_array[0].keys())
            id_key, value_key = keys[0], keys[1]
            extracted_matrix = np.array(list(zip(*((item[id_key], item[value_key]) for item in data_array))), dtype=float).T
            return extracted_matrix

        except Exception as e:
            logger.error(f"Error creating normalized nutrients: {e}")
            raise
            
    def create_food_scores(self, user):
        try:
            return response_handler.handle_response(
                response={
                    "normalized_nutrients": self.normalized_nutrients_matrix.shape,
                    "normalized_food_nutriscore": self.normalized_food_nutriscore_matrix.shape,
                    "foods_bias_matrix": self.foods_bias_matrix.shape,
                    "foods_weights_matrix": self.foods_weights_matrix.shape,
                    "nutrients_bias_matrix": self.nutrients_bias_matrix.shape,
                    "nutrients_weights_matrix": self.nutrients_weights_matrix.shape,
                }
            )
        except Exception as e:
            return response_handler.handle_exception(exception=f"Error creating food scores: {str(e)}")
