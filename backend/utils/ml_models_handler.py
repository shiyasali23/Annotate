from rest_framework.authtoken.models import Token 
from mlmodel.serializers import PredictionSerializer
from utils.response_handler import ResponseHandler

response_handler = ResponseHandler()

class MlModelsHandler:
    def regsiter_prediction(self, requested_data):
        try:
            model_id, prediction = requested_data.get('model_id'), requested_data.get('prediction')
            if not model_id or not prediction:
                return response_handler.handle_response(
                    status_code=400,
                    error=response_handler.MESSAGES["INVALID_ML_MODEL_DATA"], 
                    message=response_handler.MESSAGES['INVALID_DATA']
                )

            prediction_data = {"model_id": model_id, "prediction": prediction, "probabilities": requested_data.get('probabilities')}
            token = requested_data.get('token')
            if token:
                prediction_data['user'] = Token.objects.get(key=token).user.id

            serializer = PredictionSerializer(data=prediction_data)
            if serializer.is_valid():
                serializer.save()
                return response_handler.handle_response()
            raise Exception(serializer.errors)
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error registering prediction: {e}"
            )
