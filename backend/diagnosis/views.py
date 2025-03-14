from rest_framework.decorators import api_view

from utils.response_handler import ResponseHandler
from utils.diagnosis_handler import DiagnosisHandler

response_handler = ResponseHandler()

@api_view(['POST'])
def handle_diseases(request):
    try:
        diagnosis_handler = DiagnosisHandler()
        return diagnosis_handler.get_diagnosis(
            requested_data=request.data['data']
        ) 
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling diagnosis view: {str(e)}"
        )