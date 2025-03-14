from rest_framework.decorators import api_view 

from utils.response_handler import ResponseHandler
from utils.ml_models_handler import MlModelsHandler

response_handler = ResponseHandler()
ml_models_handler = MlModelsHandler()

@api_view(['POST'])
def handle_predictions(request):
    try:       
        return ml_models_handler.regsiter_prediction(
            requested_data=request.data['data']
        ) 
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling predictions view: {str(e)}"
        )