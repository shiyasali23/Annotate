import logging

from diagnosis.models import Disease
from diagnosis.serializers import DiseaseSerializer

from utils.objects_handler import ObjectsHandler
from utils.response_handler import ResponseHandler

logger = logging.getLogger(__name__)

objects_handler = ObjectsHandler()
response_handler = ResponseHandler()


class DiagnosisHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls, *args, **kwargs)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self.diseases_data = {}
        self._load_diseases_data()


    def _load_diseases_data(self):
        try:
            diseases_obj = objects_handler.get_all_objects(
                model=Disease, serializer_class=DiseaseSerializer
            )
            if not diseases_obj[0]:  # Check if data fetching failed
                raise Exception("Fetching diseases failed.")
            
            self.diseases_data = self._processed_diseases_data(diseases_obj[0]) 
        except Exception as e:
            print(f"Error loading diagnosis data: {e}")
            self.diseases_data = {}

    def _processed_diseases_data(self, diseases_obj):
        try:
            return {
                disease["name"].lower(): {
                    "description": disease.get("description", ""),
                    "medications": [med["name"] for med in disease.get("medications", [])],
                    "precautions": [prec["name"] for prec in disease.get("precautions", [])],
                    "diets": [diet["name"] for diet in disease.get("diets", [])]
                }
                for disease in diseases_obj
            }
        except Exception as e:
            raise Exception(f"Error processing diseases: {e}")

    def get_diagnosis(self, requested_data):
        try:
            disease_data = self.diseases_data.get(requested_data.lower())
            if not disease_data:
                return response_handler.handle_response(
                    message=response_handler.MESSAGES['NO_DISEASE_DATA'],
                    status_code=400,
                    error=response_handler.MESSAGES['NOT_FOUND']
                )
            return response_handler.handle_response(
                response=disease_data,
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting disease data: {str(e)}"
            )


    

            
