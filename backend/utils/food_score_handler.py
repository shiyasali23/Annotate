import numpy as np
import logging

from django.db.models.functions import Cast
from django.db.models import IntegerField


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
        #   - Axis 1 represents combined items: first 'foods_length' (150 foods) and then 'nutrients_length' (75 nutrients), total = 225.
        #   - Axis 2 represents all biochemicals (58 in total).
        self.biochemicals_weights_matrix = None  
        self.biochemicals_index_map = {}  # Maps biochemical IDs to column indices in the matrix.
        self.food_index_map = {}  # Maps food IDs to row indices for food items.
        self.nutrient_index_map = {}  # Maps nutrient IDs to row indices for nutrient items.
        
        self.biochemicals_len = 0  # Total number of biochemicals (expected to be 58).
        self.foods_length = 0         # Total number of foods (expected to be 150).
        self.nutrients_length = 0     # Total number of nutrients (expected to be 75).

        # Normalized matrices for additional scoring aspects.
        self.normalized_nutrients_matrix = None
        self.normalized_nutriscore_matrix = None
        self.healthy = False

        # Load data from the database and create combined matrices.
        self._load_food_nutrients_weights()
        self._load_normalized_nutrients()
        self._load_normalized_nutriscores()

    def _load_food_nutrients_weights(self):
        try:
            # Fetch FoodWeight objects along with related biochemical and food details.
            foods_weights_result = objects_handler.get_all_objects(
                model=FoodWeight,
                serializer_class=FoodWeightSerializer,
                prefetch_related_fields=['biochemical', 'food'],
                required_fields=['bias', 'weight', 'food', 'food__id', 'biochemical'],
                order_by=['food__id']
            )
            if not foods_weights_result[0]:
                raise Exception("Fetching food weights failed.")

            # Fetch NutrientWeight objects along with related biochemical and nutrient details.
            nutrients_weights_result = objects_handler.get_all_objects(
                model=NutrientWeight,
                serializer_class=NutrientWeightSerializer,
                prefetch_related_fields=['biochemical', 'nutrient'],
                required_fields=['bias', 'weight', 'nutrient', 'nutrient__id', 'biochemical'],
                order_by=['nutrient__id']
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
            self.foods_length = len(self.food_index_map)        # Expected 150
            self.nutrients_length = len(self.nutrient_index_map)  # Expected 75
            self.biochemicals_len = len(self.biochemicals_index_map)  # Expected 58
        
        except Exception as e:
            logger.error(f"Error loading food nutrient weights/bias: {e}")


    def _create_combined_matrix(self, food_weight_data, nutrient_weight_data):
        try:
            # Determine unique food and nutrient IDs directly
            unique_food_ids = []
            seen_food_ids = set()
            food_id_to_name = {}
            
            # Create lists of unique food IDs and map them to food names
            # This avoids duplicates when the same food appears with multiple biochemicals
            for item in food_weight_data:
                food_id = item["food_id"]
                if food_id not in seen_food_ids:
                    seen_food_ids.add(food_id)
                    unique_food_ids.append(food_id)
                    food_id_to_name[food_id] = item["food"]
            
            # Create lists of unique nutrient IDs and map them to nutrient names
            # This avoids duplicates when the same nutrient appears with multiple biochemicals
            unique_nutrient_ids = []
            seen_nutrient_ids = set()
            nutrient_id_to_name = {}
            
            for item in nutrient_weight_data:
                nutrient_id = item["nutrient_id"]
                if nutrient_id not in seen_nutrient_ids:
                    seen_nutrient_ids.add(nutrient_id)
                    unique_nutrient_ids.append(nutrient_id)
                    nutrient_id_to_name[nutrient_id] = item["nutrient"]
            
            # Extract unique biochemical IDs from both food and nutrient data
            biochemical_ids = sorted({item["biochemical"] for item in food_weight_data + nutrient_weight_data})
            
            # Build mapping dictionaries: Each unique ID is mapped to a sequential index
            # These maps are used for faster lookups during matrix population
            food_index_map = {food_id: i for i, food_id in enumerate(unique_food_ids)}         # Expected size: 150
            nutrient_index_map = {nutrient_id: i for i, nutrient_id in enumerate(unique_nutrient_ids)}  # Expected size: 75
            biochemicals_index_map = {biochemical_id: i for i, biochemical_id in enumerate(biochemical_ids)}  # Expected size: 58

            total_items = len(unique_food_ids) + len(unique_nutrient_ids)  # Expected: 150 + 75 = 225
            biochemical_count = len(biochemical_ids)  # Expected: 58
            
            # Initialize the combined matrix with zeros.
            # Shape: (4, total_items, biochemical_count) = (4, 225, 58)
            # - Axis 0: 4 components (food bias, food weight, nutrient bias, nutrient weight)
            # - Axis 1: 225 items (150 foods + 75 nutrients)
            # - Axis 2: 58 biochemicals
            biochemicals_weights_matrix = np.zeros((4, total_items, biochemical_count), dtype=np.float32)

            # Populate the matrix with food data:
            #   - Axis 0, index 0: food bias values
            #   - Axis 0, index 1: food weight values
            # Foods occupy the first 150 positions of Axis 1
            for item in food_weight_data:
                food_idx = food_index_map[item["food_id"]]  # Maps each food_id to a unique index (0-149)
                biochemical_idx = biochemicals_index_map[item["biochemical"]]  # Maps each biochemical to unique index (0-57)
                biochemicals_weights_matrix[0, food_idx, biochemical_idx] = item["bias"]
                biochemicals_weights_matrix[1, food_idx, biochemical_idx] = item["weight"]

            # Populate the matrix with nutrient data:
            #   - Axis 0, index 2: nutrient bias values
            #   - Axis 0, index 3: nutrient weight values
            # Nutrients occupy positions 150-224 of Axis 1 (after all foods)
            for item in nutrient_weight_data:
                # Add food count offset to place nutrients after foods in the matrix
                nutrient_idx = len(unique_food_ids) + nutrient_index_map[item["nutrient_id"]]  # Maps to index (150-224)
                biochemical_idx = biochemicals_index_map[item["biochemical"]]  # Maps to index (0-57)
                biochemicals_weights_matrix[2, nutrient_idx, biochemical_idx] = item["bias"]
                biochemicals_weights_matrix[3, nutrient_idx, biochemical_idx] = item["weight"]

            # Create return maps that include both index and name information
            # This maintains backward compatibility with code expecting this structure
            food_return_map = {food_id: {"index": idx, "food": food_id_to_name[food_id]} 
                            for food_id, idx in food_index_map.items()}
            nutrient_return_map = {nutrient_id: {"index": idx, "nutrient": nutrient_id_to_name[nutrient_id]} 
                                for nutrient_id, idx in nutrient_index_map.items()}

            return biochemicals_weights_matrix, food_return_map, nutrient_return_map, biochemicals_index_map

        except Exception as e:
            logger.error(f"Error creating combined food/nutrient matrix: {e}")
            raise
    
    def _load_normalized_nutrients(self):
        try:
            # Get all normalized nutrients data from database
            normalized_nutrients_obj = list(FoodNutrient.objects.values(
                'food__id', 'nutrient__id', 'normalized_value'
            ).order_by('food__id', Cast('nutrient__id', IntegerField())))

            if not normalized_nutrients_obj:
                raise Exception("Fetching normalized nutrients failed.")

            # Initialize matrix with zeros - shape (150, 75)
            food_nutrient_matrix = np.zeros((self.foods_length, self.nutrients_length), dtype=np.float32)

            # Direct dictionary lookup for faster access - avoid repeated checks
            food_map = self.food_index_map
            nutrient_map = self.nutrient_index_map
            
            # Pre-filter valid items to avoid checks in the loop
            valid_items = [(
                food_map[item['food__id']]["index"], 
                nutrient_map[item['nutrient__id']]["index"], 
                item['normalized_value']
            ) for item in normalized_nutrients_obj 
            if item['food__id'] in food_map and item['nutrient__id'] in nutrient_map]
            
            # Single pass population of the matrix
            for food_idx, nutrient_idx, value in valid_items:
                food_nutrient_matrix[food_idx, nutrient_idx] = value

            self.normalized_nutrients_matrix = food_nutrient_matrix

        except Exception as e:
            logger.error(f"Error loading normalized nutrients: {e}")
            
    def _load_normalized_nutriscores(self):
        try:
            # Get all normalized nutriscores from database, ordered by id
            normalized_nutriscore_obj = Food.objects.values(
                'id', 'normalized_nutriscore'
            ).order_by('id')
            
            # Initialize array with zeros - shape (150,)
            nutriscore_array = np.zeros(self.foods_length, dtype=np.float32)
            
            # Populate the array using the food_index_map for correct ordering
            for item in normalized_nutriscore_obj:
                if item['id'] in self.food_index_map:
                    idx = self.food_index_map[item['id']]["index"]
                    nutriscore_array[idx] = item['normalized_nutriscore']
            
            self.normalized_nutriscore_matrix = nutriscore_array
            
        except Exception as e:
            logger.error(f"Error loading normalized nutriscore: {e}")

        
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
            created_food_scores = self._calculate_food_scores(added_food_bias_weights, added_nutrient_bias_weights)
            
            return response_handler.handle_response(
                response={
                    # "created_food_scores": created_food_scores.tolist(),
                    "nutrient_index_map": self.nutrient_index_map,
                    "normalized_nutrients_matrix": self.normalized_nutrients_matrix.tolist(),
                    # "added_food_bias_weights": added_food_bias_weights.tolist(),
                    # "nutrient_bias_weights": self.food_index_map,
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
            # For foods: we use the first self.foods_length rows (i.e., 150 foods)
            # For nutrients: we use the remaining rows (i.e., 75 nutrients)
            food_bias_matrix = self.biochemicals_weights_matrix[0, :self.foods_length, biochemical_ids]
            food_weights_matrix = self.biochemicals_weights_matrix[1, :self.foods_length, biochemical_ids]
            nutrient_bias_matrix = self.biochemicals_weights_matrix[2, self.foods_length:, biochemical_ids]
            nutrient_weights_matrix = self.biochemicals_weights_matrix[3, self.foods_length:, biochemical_ids]
            
            # Create scaled values matrix for multiplication:
            # We need to multiply each column (selected biochemical) in the food/nutrient matrices by its corresponding scaled value.
            # Using np.ones and multiplying by scaled_values[:, np.newaxis] ensures that each biochemical's scaled value is repeated
            # for each food or nutrient item.
            food_scaled_values = np.ones((len(scaled_values), self.foods_length)) * scaled_values[:, np.newaxis]
            nutrient_scaled_values = np.ones((len(scaled_values), self.nutrients_length)) * scaled_values[:, np.newaxis]
            
            
            foods_negative_ones = np.full(food_scaled_values.shape, -1)
            nutrients_negative_ones = np.full(nutrient_scaled_values.shape, -1)
            
            # Element-wise multiplication:
            # Multiply each selected biochemical column in the matrices by its corresponding scaled value.
            multiplied_food_bias_scaled_value = food_bias_matrix * food_scaled_values * foods_negative_ones
            multiplied_food_weights_scaled_value = food_weights_matrix * food_scaled_values * foods_negative_ones
            multiplied_nutrient_bias_scaled_value = nutrient_bias_matrix * nutrient_scaled_values * nutrients_negative_ones
            multiplied_nutrient_weight_scaled_value = nutrient_weights_matrix * nutrient_scaled_values * nutrients_negative_ones
            
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
    
    def _calculate_food_scores(self, added_food_bias_weights, added_nutrient_bias_weights):
        try:
            print(f"added_nutrient_bias_weights: {added_nutrient_bias_weights.shape}")
            padded_added_nutrient_bias = np.tile(added_nutrient_bias_weights, (self.foods_length, 1))
            print(f"padded_added_nutrient_bias: {padded_added_nutrient_bias.shape}")
            multiplied_weights_normalized_nutrients = self.normalized_nutrients_matrix * padded_added_nutrient_bias
            print(f"normalized_nutrients_matrix: {self.normalized_nutrients_matrix.shape}")
            print(f"normalized_nutrients_matrix: {self.normalized_nutrients_matrix}")
            print(f"multiplied_weights_normalized_nutrients: {multiplied_weights_normalized_nutrients.shape}")
            food_nutrients_sum = np.sum(multiplied_weights_normalized_nutrients, axis=1)
            print(f"food_nutrients_sum: {food_nutrients_sum.shape}")
            return food_nutrients_sum
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error calculating food scores: {str(e)}"
            )