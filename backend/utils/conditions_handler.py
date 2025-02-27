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
            cls._instance = super(ConditionsHandler, cls).__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.conditions_data = {}
        self.healthy = False
        self._load_conditions()

    def _load_conditions(self):
        try:
            conditions, error = objects_handler.get_all_objects(
                model=BiochemicalCondition,
                serializer_class=BiochemicalConditionSerializer,
                prefetch_related_fields=['condition', 'biochemical']
            )
            if error:
                return

            for condition in conditions:
                id_val = condition["id"]
                is_hyper = condition["is_hyper"]
                self.conditions_data.setdefault(id_val, {

                    True: [],
                    False: []
                })[is_hyper].append(condition["name"])

            self.healthy = True  
        except Exception as e:
            logger.error(f"Error loading conditions: {e}")

    def get_conditions(self, requested_data):
        try:
            conditions_data = self.conditions_data
            output = []
            for data in requested_data:
                id = data["id"]
                is_hyper = data["is_hyper"]
                data = conditions_data.get(id)
                if data:
                    output.append({
                        "id": id,
                        "is_hyper": is_hyper,
                        "conditions": data[is_hyper]
                    })
                    
            if len(output) == 0:
                return response_handler.handle_response(
                    message=response_handler.MESSAGES['NO_CONDITIONS'],
                    status_code=404,
                    error=response_handler.MESSAGES['NOT_FOUND']
                    )
                
            return response_handler.handle_response(response=output)
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting conditions: {str(e)}"
            )


            
    
    

            

