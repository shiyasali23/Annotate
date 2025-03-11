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

# Instantiate the required objects for handling database objects, responses, and user operations.
objects_handler = ObjectsHandler()
response_handler = ResponseHandler()
user_handler = UserHandler()


class FoodScoreHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        # Singleton pattern: ensures only one instance of FoodScoreHandler exists.
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            try:
                cls._instance._init_once()
            except Exception as e:
                logger.error(f"Failed to initialize FoodScoreHandler: {e}")
                raise
        return cls._instance

    def _init_once(self):
        # Initialize instance variables

        # This matrix will store bias and weight values for foods and nutrients across all biochemicals.
        # Its shape will be (4, total_items, biochemical_count), where:
        #   - Axis 0 (size 4) represents:
        #         index 0: food bias, index 1: food weight,
        #         index 2: nutrient bias, index 3: nutrient weight.
        #   - Axis 1 represents combined items: first 'foods_len' (150 foods) and then 'nutrients_len' (75 nutrients), total = 225.
        #   - Axis 2 represents all biochemicals (58 in total).
        self.biochemicals_weights_matrix = None  
        self.biochemicals_index_map = {}  # Maps biochemical IDs to column indices in the matrix.
        self.food_index_map = {}  # Maps food IDs to row indices for food items.
        self.nutrient_index_map = {}  # Maps nutrient IDs to row indices for nutrient items.
        
        self.nutrient_names_map = {} # Maps nutrient IDs to nutrient names
        self.food_names_map = {} # Maps food IDs to food names
        
        self.biochemicals_len = 0  # Total number of biochemicals (expected to be 58).
        self.foods_len = 0         # Total number of foods (expected to be 150).
        self.nutrients_len = 0     # Total number of nutrients (expected to be 75).

        # Normalized matrices for additional scoring aspects.
        self.normalized_nutrients_matrix = None
        self.normalized_food_nutriscore_matrix = None
        self.healthy = False

        # Load data from the database and create combined matrices.
        self._load_food_nutrients_weights()
        self._load_normalized_nutrients_nutriscores()

    def _load_food_nutrients_weights(self):
        try:
            # Fetch FoodWeight objects along with related biochemical and food details.
            foods_weights_result = objects_handler.get_all_objects(
                model=FoodWeight,
                serializer_class=FoodWeightSerializer,
                prefetch_related_fields=['biochemical', 'food']
            )
            if not foods_weights_result[0]:
                raise Exception("Fetching food weights failed.")

            # Fetch NutrientWeight objects along with related biochemical and nutrient details.
            nutrients_weights_result = objects_handler.get_all_objects(
                model=NutrientWeight,
                serializer_class=NutrientWeightSerializer,
                prefetch_related_fields=['biochemical', 'nutrient']
            )
            if not nutrients_weights_result[0]:
                raise Exception("Fetching nutrient weights failed.")

            # Create the combined matrix that holds both food and nutrient bias and weight values.
            # This function returns the combined matrix along with the index mappings.
            self.biochemicals_weights_matrix, self.food_index_map, self.nutrient_index_map, self.biochemicals_index_map = (
                self._create_combined_matrix(
                    food_weight_data=foods_weights_result[0],
                    nutrient_weight_data=nutrients_weights_result[0]
                )
            )

            # Set the lengths based on the mapping sizes.
            self.foods_len = len(self.food_index_map)        # Expected 150
            self.nutrients_len = len(self.nutrient_index_map)  # Expected 75
            self.biochemicals_len = len(self.biochemicals_index_map)  # Expected 58
        
        except Exception as e:
            logger.error(f"Error loading food nutrient weights/bias: {e}")

    def _load_normalized_nutrients_nutriscores(self):
        try:
            # Fetch normalized nutrient values.
            food_nutrients_objs = FoodNutrient.objects.values('nutrient__name','nutrient__id', 'normalized_value')
            if not food_nutrients_objs:
                raise Exception("Fetching normalized nutrients failed.")
            
            
            nutrient_names_map = {}
            normalized_nutrients = []

            for item in food_nutrients_objs:
                nutrient_names_map[item["nutrient__id"]] = item["nutrient__name"]
                normalized_nutrients.append({
                    "nutrient__id": item["nutrient__id"],
                    "normalized_value": item["normalized_value"]
                })
            self.nutrient_names_map = nutrient_names_map

            # Create a NumPy array from the normalized nutrient values.
            self.normalized_nutrients_matrix = self._create_nutrients_nutriscore_matrix(normalized_nutrients)

            # Fetch normalized food nutriscore values.
            food_obj = Food.objects.values('name', 'id', 'normalized_nutriscore')
            if not food_obj:
                raise Exception("Fetching normalized food nutriscore failed.")
            
            food_names_map = {}
            normalized_food_nutriscore = []
            for item in food_obj:
                food_names_map[item["id"]] = item["name"]
                normalized_food_nutriscore.append({
                    "id": item["id"],
                    "normalized_nutriscore": item["normalized_nutriscore"]
                })

            self.food_names_map = food_names_map

            # Create a NumPy array from the normalized food nutriscore values.
            self.normalized_food_nutriscore_matrix = self._create_nutrients_nutriscore_matrix(normalized_food_nutriscore)

        except Exception as e:
            logger.error(f"Error loading normalized nutrients/nutriscore: {e}")

    def _create_combined_matrix(self, food_weight_data, nutrient_weight_data):
        try:
            # Determine unique IDs for foods, nutrients, and biochemicals.
            food_ids = sorted({item["food"] for item in food_weight_data})
            nutrient_ids = sorted({item["nutrient"] for item in nutrient_weight_data})
            biochemical_ids = sorted({item["biochemical"] for item in food_weight_data + nutrient_weight_data})

            # Build mapping dictionaries: Each unique ID is mapped to an index.
            food_index_map = {food_id: i for i, food_id in enumerate(food_ids)}
            nutrient_index_map = {nutrient_id: i for i, nutrient_id in enumerate(nutrient_ids)}
            biochemicals_index_map = {biochemical_id: i for i, biochemical_id in enumerate(biochemical_ids)}

            total_items = len(food_ids) + len(nutrient_ids)  # Total items = 150 + 75 = 225
            biochemical_count = len(biochemical_ids)  # Expected 58
            # Initialize the combined matrix with zeros.
            # Shape: (4, total_items, biochemical_count)
            biochemicals_weights_matrix = np.zeros((4, total_items, biochemical_count), dtype=np.float32)

            # Populate the matrix with food data:
            #   - Axis 0, index 0: food bias values
            #   - Axis 0, index 1: food weight values
            for item in food_weight_data:
                food_idx = food_index_map[item["food"]]
                biochemical_idx = biochemicals_index_map[item["biochemical"]]
                biochemicals_weights_matrix[0, food_idx, biochemical_idx] = item["bias"]
                biochemicals_weights_matrix[1, food_idx, biochemical_idx] = item["weight"]

            # Populate the matrix with nutrient data:
            #   - Nutrient data is placed in the second part of Axis 1.
            #   - Axis 0, index 2: nutrient bias values
            #   - Axis 0, index 3: nutrient weight values
            for item in nutrient_weight_data:
                nutrient_idx = len(food_ids) + nutrient_index_map[item["nutrient"]]
                biochemical_idx = biochemicals_index_map[item["biochemical"]]
                biochemicals_weights_matrix[2, nutrient_idx, biochemical_idx] = item["bias"]
                biochemicals_weights_matrix[3, nutrient_idx, biochemical_idx] = item["weight"]

            return biochemicals_weights_matrix, food_index_map, nutrient_index_map, biochemicals_index_map

        except Exception as e:
            logger.error(f"Error creating combined food/nutrient matrix: {e}")
            raise

    def _create_nutrients_nutriscore_matrix(self, data_array):
        try:
            # The data_array is a list of dictionaries with keys: e.g. 'nutrient__id' and 'normalized_value'
            keys = list(data_array[0].keys())
            id_key, value_key = keys[0], keys[1]
            # Create a NumPy array of the normalized values
            return np.array([item[value_key] for item in data_array], dtype=np.float32)
        except Exception as e:
            logger.error(f"Error creating normalized nutrients: {e}")
            raise
        
    def validate_requested_data(self, requested_data):
        # Validate each entry in requested_data to ensure the biochemical id is within range and value is numeric.
        invalid_ids = []

        for item in requested_data:
            if item['id'] > self.biochemicals_len or not isinstance(item['value'], (int, float)):
                invalid_ids.append(item['id'])

        if invalid_ids:
            return None, invalid_ids

        # Construct validated_data with keys "id" and "scaled_value"
        validated_data = [{"id": item['id'], "scaled_value": float(item['value'])} for item in requested_data]
        return validated_data, None

    def create_food_scores(self, user, requested_data):
        try:
            validated_data, invalid_ids = self.validate_requested_data(requested_data)
            if invalid_ids:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['INVALID_DATA'],
                    status_code=400, 
                    message=f"Invalid Id or data in: {', '.join(map(str, invalid_ids))}" 
                )
            
            # Calculate the food scores based on the validated data
            added_food_bias_weights, added_nutrient_bias_weights, = self._calculate_added_food_nutrients_weights(validated_data)
            return response_handler.handle_response(
                response={
                    "added_food_bias_weights": added_food_bias_weights.tolist(),
                    "added_nutrient_bias_weights": added_nutrient_bias_weights.tolist(),
                    "food_names": self.food_names_map,
                }
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating food scores: {str(e)}"
            )
    
    def _calculate_added_food_nutrients_weights(self, validated_data):
        try:
            # Get biochemical indices and their scaled values from the validated data.
            # biochemical_ids will be indices into the biochemical (column) dimension of the combined matrix.
            biochemical_ids = np.array([self.biochemicals_index_map[item["id"]] for item in validated_data])
            scaled_values = np.array([item["scaled_value"] for item in validated_data], dtype=np.float32)
            
            # Ensure alignment by sorting both biochemical_ids and scaled_values.
            # This guarantees that the order of scaled_values corresponds to the order of the selected columns.
            sort_order = np.argsort(biochemical_ids)
            biochemical_ids = biochemical_ids[sort_order]
            scaled_values = scaled_values[sort_order]
            
            # Slice the combined matrix to extract only the columns for the selected biochemicals.
            # For foods: we use the first self.foods_len rows (i.e., 150 foods)
            # For nutrients: we use the remaining rows (i.e., 75 nutrients)
            food_bias_matrix = self.biochemicals_weights_matrix[0, :self.foods_len, biochemical_ids]
            food_weights_matrix = self.biochemicals_weights_matrix[1, :self.foods_len, biochemical_ids]
            nutrient_bias_matrix = self.biochemicals_weights_matrix[2, self.foods_len:, biochemical_ids]
            nutrient_weights_matrix = self.biochemicals_weights_matrix[3, self.foods_len:, biochemical_ids]
            
            # Create scaled values matrix for multiplication:
            # We need to multiply each column (selected biochemical) in the food/nutrient matrices by its corresponding scaled value.
            # Using np.ones and multiplying by scaled_values[:, np.newaxis] ensures that each biochemical's scaled value is repeated
            # for each food or nutrient item.
            food_scaled_values = np.ones((len(scaled_values), self.foods_len)) * scaled_values[:, np.newaxis]
            nutrient_scaled_values = np.ones((len(scaled_values), self.nutrients_len)) * scaled_values[:, np.newaxis]
            
            # Element-wise multiplication:
            # Multiply each selected biochemical column in the matrices by its corresponding scaled value.
            multiplied_food_bias_scaled_value = food_bias_matrix * food_scaled_values
            multiplied_food_weights_scaled_value = food_weights_matrix * food_scaled_values
            multiplied_nutrient_bias_scaled_value = nutrient_bias_matrix * nutrient_scaled_values
            multiplied_nutrient_weight_scaled_value = nutrient_weights_matrix * nutrient_scaled_values
            
            added_food_bias = np.sum(multiplied_food_bias_scaled_value, axis=0)
            added_food_weights = np.sum(multiplied_food_weights_scaled_value, axis=0)
            added_nutrient_bias = np.sum(multiplied_nutrient_bias_scaled_value, axis=0)
            added_nutrient_weight = np.sum(multiplied_nutrient_weight_scaled_value, axis=0)
            
            added_food_weight_bias = added_food_bias + added_food_weights
            added_nutrient_weight_bias = added_nutrient_bias + added_nutrient_weight

            return (
                added_food_weight_bias,
                added_nutrient_weight_bias,
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error calculating food scores: {str(e)}"
            )
