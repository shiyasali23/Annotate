import logging

from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler

from adminpanel.models import BiochemicalCondition
from adminpanel.serializers import BiochemicalConditionSerializer

from utils.objects_handler import ObjectsHandler
from utils.response_handler import ResponseHandler


logger = logging.getLogger(__name__)

objects_handler = ObjectsHandler()
response_handler = ResponseHandler()

class ConditionsHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.conditions_data = {}
        self.healthy = False
        self._load_conditions()

    def _load_conditions(self):
        try:
            print("Loading conditions")
            conditions, error = objects_handler.get_all_objects(
                model=BiochemicalCondition,
                serializer_class=BiochemicalConditionSerializer,
                prefetch_related_fields=['condition', 'biochemical']            
            )
            
            if error:
                return
            
            for item in conditions:
                biochemical_id = item["biochemical"]
                is_hyper = item["is_hyper"]
                
                if biochemical_id not in self.conditions_data:
                    self.conditions_data[biochemical_id] = {}
                
                if is_hyper not in self.conditions_data[biochemical_id]:
                    self.conditions_data[biochemical_id][is_hyper] = []
                
                self.conditions_data[biochemical_id][is_hyper].append(item["name"])  
                
            self.healthy = True          
            
        except Exception as e:
            logger.error(f"Error loading conditions: {e}")

    def get_conditions(self, requested_data):  
        try:
            results = {
                f"{item['id']}_{item['is_hyper']}": self.conditions_data.get(item["id"], {}).get(item["is_hyper"], []) 
                for item in requested_data  
            }
            return response_handler.handle_response(
                response=results  
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting conditions: {str(e)}"
            )

            
    
    

            

