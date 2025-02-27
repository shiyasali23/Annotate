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

class BiometricsHandler:
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
        self._load_biochemicals()

    def _load_biochemicals(self):
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
            
    def validate_requested_data(self, requested_data):
        try:
            invalid_ids = []
            valid_ids = []
            valid_values = []

            for item in requested_data:
                if item['id'] > len(self.biochemicals_validity_data) or item['value'] in [None, ""]:
                    invalid_ids.append(item['id'])
                else:
                    try:
                        valid_values.append(float(item['value']))
                        valid_ids.append(item['id'])  
                    except ValueError:
                        invalid_ids.append(item['id'])

            return np.array(valid_values, dtype=float), valid_ids, invalid_ids, 
        except Exception as e:
            logger.error(f"Error validating biochemicals: {e}")
            return np.array([]), [], []
    
    def handle_biometrics(self, user, requested_data): 
        if self.healthy == False:
            return response_handler.handle_exception(
                exception=f"Error loading biochemicals in BiometricsHandler"
        )      
        try: 
            values, valid_ids, invalid_ids = self.validate_requested_data(requested_data=requested_data)
            if len(invalid_ids) > 0:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['INVALID_DATA'],
                    status_code=400, 
                    message=f"Invalid fields: {', '.join(map(str, invalid_ids))}" 
                )
            
            return self._create_biometrics_entry(
                user=user,
                values=values,
                valid_ids=valid_ids
            )                     
        except Exception as e:
            response_handler.handle_exception(
                exception=f"Error handling biochemicals view: {str(e)}"
            )
    
    def _create_biometrics_entry(self, user, values, valid_ids,):
        try:
            
            healthy_mins, healthy_maxs, error = self.get_min_healthy_maxs(
                valid_ids=valid_ids,
                gender=user.gender
            )
            if error:
                return response_handler.handle_exception(
                    exception=f"Error getting min/max values min: {error}"
                )
            
            scaled_health_weights, error = self._scale_health_weights(
                values=values,
                healthy_mins=healthy_mins,
                healthy_maxs=healthy_maxs
            )
            if error:
                return response_handler.handle_exception(
                    exception=f"Error scaling health weights: {error}"
                )
            
            health_score = float(np.sum(scaled_health_weights))
            biometrics_entry = BiometricsEntrySerializer(data={"user": user.id, "health_score": health_score})
            if biometrics_entry.is_valid():
                biometrics_entry_instance = biometrics_entry.save()
                return self._create_biometrics(
                    user=user,
                    values=values,
                    valid_ids=valid_ids,
                    healthy_mins=healthy_mins,
                    healthy_maxs=healthy_maxs,
                    scaled_health_weights=scaled_health_weights,
                    biometrics_entry = biometrics_entry_instance.id
                )
            else:
                return response_handler.handle_exception(
                    exception=f"Error on BiometricsEntry serializer: {str(biometrics_entry.errors)}"
                )

        except Exception as e:
            response_handler.handle_exception(
                exception=f"Error creating biometrics entry: {str(e)}"
            )
        
    def get_min_healthy_maxs(self, valid_ids, gender):
        try:
            biochemicals_data = self.male_biochemicals_data if gender == "male" else self.female_biochemicals_data
            indices = np.array(valid_ids) * 2 - 2  

            healthy_mins = np.take(biochemicals_data, indices, mode='clip')  
            healthy_maxs = np.take(biochemicals_data, indices + 1, mode='clip')  

            return healthy_mins.astype(float), healthy_maxs.astype(float), None
        except Exception as e:
            return np.array([]), np.array([]), str(e)
        

    def _scale_health_weights(self,values, healthy_mins, healthy_maxs):
        try:
            optimum_value = (healthy_mins + healthy_maxs) / 2.0
            result = np.where(
                (values >= healthy_mins) & (values <= healthy_maxs),
                np.round(1 - np.abs(2 * (values - optimum_value) / (healthy_maxs - healthy_mins)), 2),
                np.where(
                    values < healthy_mins,
                    np.round(values - healthy_mins, 2),
                    np.round(healthy_maxs - values, 2)
                )
            )
            return result, None
        except Exception as e:
            return None, str(e)
        
    
    def _create_biometrics(self, user, valid_ids, values, healthy_mins, healthy_maxs, scaled_health_weights, biometrics_entry):
        try:
            scaled_biometrics, error = self._scale_biometrics(
                values=values,
                healthy_min=healthy_mins,
                healthy_max=healthy_maxs
            )
            if error:
                return response_handler.handle_exception(
                    exception=f"Error on getting scaled biometrics: {error}"
                )
            current_timestamp = timezone.now()
            
            
            
            biometrics_data = []
            for index, id in enumerate(valid_ids):
                scaled_value = scaled_biometrics[index]
                biometrics_data.append({
                    "biometricsentry": biometrics_entry,  
                    "biochemical": id,  
                    "value": values[index],
                    "scaled_value": scaled_value,  
                    "health_weight": scaled_health_weights[index],  
                    "is_hyper": True if scaled_value >= 1 else (False if scaled_value <= -1 else None),
                    "expiry_date": current_timestamp + timedelta(days=self.biochemicals_validity_data[id - 1])
                })

            biometrics_serializer = BiometricsSerializer(data=biometrics_data, many=True)
            if biometrics_serializer.is_valid():
                biometrics_serializer.save()
                return user_handler.get_user_data(
                    user=user, 
                    user_data=False
                )
            else:
                return response_handler.handle_exception(
                    exception=f"Error on Biometrics serializer {biometrics_serializer.errors}"
                )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating biometrics: {str(e)}"
            )


    
    def _scale_biometrics(self,values, healthy_min, healthy_max):
        try: 
            optimum_value = (healthy_min + healthy_max) / 2.0
            scaled_values = np.where(
                (values >= healthy_min) & (values <= healthy_max),
                np.round(2 * (values - optimum_value) / (healthy_max - healthy_min), 2),
                np.round(np.where(values < healthy_min, values - healthy_min, values - healthy_max), 2)
            )
            return scaled_values, None
        except Exception as e:
            return None, str(e)
                       
    

            

