from django.db.models.functions import Cast
from django.db.models import IntegerField

import numpy as np
import logging
import json

from adminpanel.serializers import FoodWeightSerializer, NutrientWeightSerializer, FoodNutrient, Food
from adminpanel.models import FoodWeight, NutrientWeight

from webapp.serializers import FoodNutrientScoreSerializer

from utils.objects_handler import ObjectsHandler
from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler

logger = logging.getLogger(__name__)

# Initialize utility handlers for database operations, API responses, and user management
objects_handler = ObjectsHandler()
response_handler = ResponseHandler()
user_handler = UserHandler()


class FoodScoreHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        # Implement singleton pattern to ensure only one instance exists application-wide
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            try:
                cls._instance._init_once()
            except Exception as e:
                logger.error(f"Failed to initialize FoodScoreHandler: {e}")
                raise
        return cls._instance

    def _init_once(self):
        # Initialize core data structures for the scoring system
        
        # Matrix to store all bias and weight values for foods and nutrients across biochemicals
        # Shape: (4, 225, 58) - representing (data_type, items, biochemicals)
        self.biochemicals_weights_matrix = None  
        self.biochemicals_index_map = {}  # Maps biochemical IDs to their matrix column indices
        self.biochemicals_len = 0  # Expected to be 58 biochemicals
        
        self.food_index_map = {}  # Maps food IDs to their matrix row indices
        self.foods_length = 0      # Expected to be 150 foods
        self.food_names = {}  # Maps food IDs to their names
        self.food_indices = {}  # Maps food names to their matrix row indices
        
        self.nutrient_index_map = {}  # Maps nutrient IDs to their matrix row indices
        self.nutrients_length = 0  # Expected to be 75 nutrients
        self.nutrient_names = {}  # Maps nutrient IDs to their names
        self.nutrient_indices = {}  # Maps nutrient names to their matrix row indices

        # Matrices for normalized nutrient values and nutriscores
        self.normalized_nutrients_matrix = None
        self.normalized_nutriscore_matrix = None
        
        self.latest_biometrics_entry = None

        # Load all required data from database
        self._load_food_nutrients_weights()
        self._load_normalized_nutrients()
        self._load_normalized_nutriscores()

    def _load_food_nutrients_weights(self):
        try:
            # Retrieve all food weights with their related biochemical data
            foods_weights_result = objects_handler.get_all_objects(
                model=FoodWeight,
                serializer_class=FoodWeightSerializer,
                prefetch_related_fields=['biochemical', 'food'],
                required_fields=['bias', 'weight', 'food', 'food__id', 'biochemical'],
                order_by=['food__id']
            )
            if not foods_weights_result[0]:
                raise Exception("Fetching food weights failed.")

            # Retrieve all nutrient weights with their related biochemical data
            nutrients_weights_result = objects_handler.get_all_objects(
                model=NutrientWeight,
                serializer_class=NutrientWeightSerializer,
                prefetch_related_fields=['biochemical', 'nutrient'],
                required_fields=['bias', 'weight', 'nutrient', 'nutrient__id', 'biochemical'],
                order_by=['nutrient__id']
            )
            if not nutrients_weights_result[0]:
                raise Exception("Fetching nutrient weights failed.")

            return self._create_combined_matrix(
                food_weight_data=foods_weights_result[0],
                nutrient_weight_data=nutrients_weights_result[0]
            )

        
        except Exception as e:
            logger.error(f"Error fetching food nutrient weights/bias: {e}")
            raise


    def _create_combined_matrix(self, food_weight_data, nutrient_weight_data):
        try:
            # Extract unique food IDs while avoiding duplicates
            unique_food_ids = []
            seen_food_ids = set()
            food_id_to_name = {}
            
            # Process food data to extract unique foods and build ID-to-name mapping
            for item in food_weight_data:
                food_id = item["food_id"]
                if food_id not in seen_food_ids:
                    seen_food_ids.add(food_id)
                    unique_food_ids.append(food_id)
                    food_id_to_name[food_id] = item["food"]
            
            # Process nutrient data to extract unique nutrients and build ID-to-name mapping
            unique_nutrient_ids = []
            seen_nutrient_ids = set()
            nutrient_id_to_name = {}
            
            for item in nutrient_weight_data:
                nutrient_id = item["nutrient_id"]
                if nutrient_id not in seen_nutrient_ids:
                    seen_nutrient_ids.add(nutrient_id)
                    unique_nutrient_ids.append(nutrient_id)
                    nutrient_id_to_name[nutrient_id] = item["nutrient"]
            
            # Extract unique biochemical IDs from combined data sources
            biochemical_ids = sorted({item["biochemical"] for item in food_weight_data + nutrient_weight_data})
            
            # Create index mappings for fast lookups
            food_index_map = {food_id: i for i, food_id in enumerate(unique_food_ids)}         # Maps food ID to index
            nutrient_index_map = {nutrient_id: i for i, nutrient_id in enumerate(unique_nutrient_ids)}  # Maps nutrient ID to index
            biochemicals_index_map = {biochemical_id: i for i, biochemical_id in enumerate(biochemical_ids)}  # Maps biochemical ID to index

            total_items = len(unique_food_ids) + len(unique_nutrient_ids)  # Should be 225 total items
            biochemical_count = len(biochemical_ids)  # Should be 58 biochemicals
            
            # Initialize the 3D matrix with zeros - structure: (4, 225, 58)
            # Dimensions: [bias/weight type, food/nutrient items, biochemicals]
            biochemicals_weights_matrix = np.zeros((4, total_items, biochemical_count), dtype=np.float16)

            # Populate food bias values (index 0) and food weight values (index 1)
            for item in food_weight_data:
                food_idx = food_index_map[item["food_id"]]  # Get food's position in matrix
                biochemical_idx = biochemicals_index_map[item["biochemical"]]  # Get biochemical's position
                biochemicals_weights_matrix[0, food_idx, biochemical_idx] = item["bias"]  # Store bias
                biochemicals_weights_matrix[1, food_idx, biochemical_idx] = item["weight"]  # Store weight

            # Populate nutrient bias values (index 2) and nutrient weight values (index 3)
            # Nutrients are positioned after foods in the matrix
            for item in nutrient_weight_data:
                nutrient_idx = len(unique_food_ids) + nutrient_index_map[item["nutrient_id"]]  # Offset by food count
                biochemical_idx = biochemicals_index_map[item["biochemical"]]
                biochemicals_weights_matrix[2, nutrient_idx, biochemical_idx] = item["bias"]  # Store bias
                biochemicals_weights_matrix[3, nutrient_idx, biochemical_idx] = item["weight"]  # Store weight

            # Create return maps with both index and name information
            food_index_map = {food_id: {"index": idx, "food": food_id_to_name[food_id]} 
                            for food_id, idx in food_index_map.items()}
            
            
            nutrient_index_map = {nutrient_id: {"index": idx, "nutrient": nutrient_id_to_name[nutrient_id]} 
                                for nutrient_id, idx in nutrient_index_map.items()}


            #for biochemicals
            self.biochemicals_index_map = biochemicals_index_map
            self.biochemicals_len = len(biochemicals_index_map)
            self.biochemicals_weights_matrix = biochemicals_weights_matrix
            
            # For foods:
            self.food_index_map = food_index_map
            self.foods_length = len(food_index_map)
            self.food_names = [food_index_map[food_id]['food'] for food_id in food_index_map]
            self.food_indices = np.array([food_index_map[food_id]['index'] for food_id in food_index_map])

            # For nutrients:
            self.nutrient_index_map = nutrient_index_map
            self.nutrients_length = len(nutrient_index_map)
            self.nutrient_names = [nutrient_index_map[nutrient_id]['nutrient'] for nutrient_id in nutrient_index_map]
            self.nutrient_indices = np.array([nutrient_index_map[nutrient_id]['index'] for nutrient_id in nutrient_index_map])
            
    
        except Exception as e:
            logger.error(f"Error creating combined food/nutrient matrix: {e}")
            raise
    
    def _load_normalized_nutrients(self):
        try:
            # Retrieve normalized nutrient values for all food-nutrient combinations
            normalized_nutrients_obj = list(FoodNutrient.objects.values(
                'food__id', 'nutrient__id', 'normalized_value'
            ).order_by('food__id', Cast('nutrient__id', IntegerField())))

            if not normalized_nutrients_obj:
                raise Exception("Fetching normalized nutrients failed.")

            # Initialize matrix to store normalized nutrient values - shape (150, 75)
            food_nutrient_matrix = np.zeros((self.foods_length, self.nutrients_length), dtype=np.float16)

            # Cache mappings for faster lookups
            food_map = self.food_index_map
            nutrient_map = self.nutrient_index_map
            
            # Pre-filter valid items to improve performance
            valid_items = [(
                food_map[item['food__id']]["index"], 
                nutrient_map[item['nutrient__id']]["index"], 
                item['normalized_value']
            ) for item in normalized_nutrients_obj 
            if item['food__id'] in food_map and item['nutrient__id'] in nutrient_map]
            
            # Populate the matrix with normalized nutrient values
            for food_idx, nutrient_idx, value in valid_items:
                food_nutrient_matrix[food_idx, nutrient_idx] = value

            self.normalized_nutrients_matrix = food_nutrient_matrix

        except Exception as e:
            logger.error(f"Error loading normalized nutrients: {e}")
            
    def _load_normalized_nutriscores(self):
        try:
            # Retrieve normalized nutriscores for all foods
            normalized_nutriscore_obj = Food.objects.values(
                'id', 'normalized_nutriscore'
            ).order_by('id')
            
            # Initialize array for nutriscores - shape (150,)
            nutriscore_array = np.zeros(self.foods_length, dtype=np.float16)
            
            # Populate the array with nutriscore values
            for item in normalized_nutriscore_obj:
                if item['id'] in self.food_index_map:
                    idx = self.food_index_map[item['id']]["index"]
                    nutriscore_array[idx] = item['normalized_nutriscore']
            
            self.normalized_nutriscore_matrix = nutriscore_array
            
        except Exception as e:
            logger.error(f"Error loading normalized nutriscore: {e}")

        
    
    def create_foods_nutrients_scores(self, biochemicals_scaled_values, latest_biometrics_entry):
        try:
            self.latest_biometrics_entry = latest_biometrics_entry
            # Extract biochemical indices and their scaled values from validated data
            biochemical_ids = np.array([self.biochemicals_index_map[item["id"]] for item in biochemicals_scaled_values])
            scaled_values = np.array([item["value"] for item in biochemicals_scaled_values], dtype=np.float16)
            
            # Sort both arrays to ensure alignment
            sort_order = np.argsort(biochemical_ids)
            biochemical_ids = biochemical_ids[sort_order]
            scaled_values = scaled_values[sort_order]
            
            # Extract bias and weight matrices for selected biochemicals
            food_bias_matrix = self.biochemicals_weights_matrix[0, :self.foods_length, biochemical_ids]
            food_weights_matrix = self.biochemicals_weights_matrix[1, :self.foods_length, biochemical_ids]
            nutrient_bias_matrix = self.biochemicals_weights_matrix[2, self.foods_length:, biochemical_ids]
            nutrient_weights_matrix = self.biochemicals_weights_matrix[3, self.foods_length:, biochemical_ids]
            
            # Create matrices for scaling biochemical values
            food_scaled_values = np.ones((len(scaled_values), self.foods_length)) * scaled_values[:, np.newaxis]
            nutrient_scaled_values = np.ones((len(scaled_values), self.nutrients_length)) * scaled_values[:, np.newaxis]
            
            # Create negative ones matrices for calculation
            foods_negative_ones = np.full(food_scaled_values.shape, -1)
            nutrients_negative_ones = np.full(nutrient_scaled_values.shape, -1)
            
            # Perform element-wise multiplication with scaled values and negative coefficients
            multiplied_food_bias_scaled_value = food_bias_matrix * food_scaled_values * foods_negative_ones
            multiplied_food_weights_scaled_value = food_weights_matrix * food_scaled_values * foods_negative_ones
            multiplied_nutrient_bias_scaled_value = nutrient_bias_matrix * nutrient_scaled_values * nutrients_negative_ones
            multiplied_nutrient_weight_scaled_value = nutrient_weights_matrix * nutrient_scaled_values * nutrients_negative_ones
            
            # Sum the contributions across all biochemicals
            added_food_bias = np.sum(multiplied_food_bias_scaled_value, axis=0)
            added_food_weights = np.sum(multiplied_food_weights_scaled_value, axis=0)
            added_nutrient_bias = np.sum(multiplied_nutrient_bias_scaled_value, axis=0)
            added_nutrient_weight = np.sum(multiplied_nutrient_weight_scaled_value, axis=0)
            
            # Combine bias and weights for foods and nutrients
            added_food_weight_bias = added_food_bias + added_food_weights
            added_nutrient_weight_bias = added_nutrient_bias + added_nutrient_weight

            return self._calculate_food_scores(
                added_food_bias_weights=added_food_weight_bias, 
                added_nutrient_bias_weights = added_nutrient_weight_bias
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error calculating food nutrient biases and weights: {str(e)}"
            )
    
    def _calculate_food_scores(self, added_food_bias_weights, added_nutrient_bias_weights):
        try:   
            # Get the pre-calculated normalized matrices
            normalized_nutriscore_matrix = self.normalized_nutriscore_matrix  
            normalized_nutrients_matrix = self.normalized_nutrients_matrix      
            
            # Create a matrix where each row has the nutrient bias weights (repeat for each food)
            padded_added_nutrient_bias = np.tile(added_nutrient_bias_weights, (self.foods_length, 1))
            
            # Multiply nutrient matrix by nutrient bias weights to get weighted nutrient values
            multiplied_weights_normalized_nutrients = normalized_nutrients_matrix * padded_added_nutrient_bias
           
            # Sum along nutrient axis to get total nutrient scores for each food
            nutrients_sum = np.sum(multiplied_weights_normalized_nutrients, axis=1)
            
            # Normalize food-nutrient scores to [0,1] range
            normalized_nutrients_sum = (nutrients_sum - np.min(nutrients_sum)) / (np.ptp(nutrients_sum) + 1e-9)           
            
            # Normalize food bias weights to [0,1] range
            normalized_added_food_bias_weights = (added_food_bias_weights - np.min(added_food_bias_weights)) / (np.ptp(added_food_bias_weights) + 1e-9)
            
            # Calculate final scores by combining all normalized components
            calculated_food_scores = normalized_nutrients_sum + normalized_added_food_bias_weights + normalized_nutriscore_matrix
            
            return self._map_nutrinets_food_scores(
                calculated_food_scores=calculated_food_scores,
                normalized_nutrients_sum = normalized_nutrients_sum
            )
        
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error calculating food scores: {str(e)}"
            )
            

    def _map_nutrinets_food_scores(self, calculated_food_scores, normalized_nutrients_sum):
        try:
            # Extract scores using direct indexing
            food_scores = calculated_food_scores[self.food_indices]
            mapped_food_scores = dict(zip(self.food_names, food_scores))

            # Extract nutrient sums using direct indexing
            nutrient_sums = normalized_nutrients_sum[self.nutrient_indices]
            mapped_nutrient_sums = dict(zip(self.nutrient_names, nutrient_sums))

            return self._register_foods_nutrients_scores(
                mapped_food_scores = mapped_food_scores,
                mapped_nutrient_sums = mapped_nutrient_sums
            )
            
            return response_handler.handle_response(
                response={
                    'mapped_food_scores': mapped_food_scores,
                    'mapped_nutrient_sums': mapped_nutrient_sums
                }
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error registering food scores: {str(e)}"
            )
        
    def _register_foods_nutrients_scores(self, mapped_food_scores, mapped_nutrient_sums):
        try:
            data = {
                'biometricsentry': self.latest_biometrics_entry,  # Ensure this is just the ID
                'foods_score': json.dumps(mapped_food_scores),  
                'nutrinets_score': json.dumps(mapped_nutrient_sums),
            }
            foods_nutrients_score_serializer = FoodNutrientScoreSerializer(data=data)
            if foods_nutrients_score_serializer.is_valid():
                instance = foods_nutrients_score_serializer.save()
                return FoodNutrientScoreSerializer(instance).data, None                
            else:
                return None, foods_nutrients_score_serializer.errors

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error registering food nutrients scores: {str(e)}"
            )


            
