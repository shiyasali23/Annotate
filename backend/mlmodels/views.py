from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework import authentication, permissions, status
from django.shortcuts import get_object_or_404

import json
import requests
import logging

from .serializers import MachineLearningModelSerializer, PredictionSerializer
from .models import MachineLearningModel, Prediction

from diagnosis.models import Symptom, Medication, Precaution, Diet

logger = logging.getLogger(__name__)

def get_error_message(error_dict):
    if isinstance(error_dict, dict):
        for field, errors in error_dict.items():
            if isinstance(errors, list):
                return f"{field}: {errors[0]}"
            elif isinstance(errors, str):
                return f"{field}: {errors}"
    return str(error_dict)

def handle_response(data=None, error=None, status_code=status.HTTP_200_OK):
    if error:
        error_message = get_error_message(error)
        logger.error(f"Error: {error_message}")
        return Response({'error': error_message}, status=status_code)
    return Response(data, status=status_code)


#_______--------------------------------------------------------------------------------_______
def fetch_and_validate_models():
    response = requests.get('http://localhost:8001/register_models/')
    response.raise_for_status()
    data = response.json()
    for item in data:
        item['status'] = 'active'
    return data


@api_view(['POST'])
def register_model(request):
    try:
        data = fetch_and_validate_models()
        model_serializer = MachineLearningModelSerializer(data=data, partial=True, many=True)
        if model_serializer.is_valid():
            model_serializer.save()
            for registered_model in model_serializer.data:
                logger.info(f"Registered model: {registered_model['name']}")
            return handle_response({"message": "Models registered successfully!"}, status_code=201)
        logger.error(f"Model serializer errors: {model_serializer.errors}")
        return handle_response(error=model_serializer.errors, status_code=400)
    except requests.RequestException as e:
        logger.error(f"Failed to register model: {e}")
        return handle_response(error="Failed to connect to FastAPI service", status_code=500)

#_______--------------------------------------------------------------------------------_______


def fetch_and_serialize_models(model_id, is_diagnosis_model):
    try:
        fields = ['name', 'id', 'feature_names', 'status', 'output_maps', 'accuracy', 'highest_feature_impact']

        if is_diagnosis_model:
            queryset = MachineLearningModel.objects.get(id=model_id)
        else:
            queryset = MachineLearningModel.objects.exclude(id=model_id)

        serializer = MachineLearningModelSerializer(queryset, many=not is_diagnosis_model, fields=fields)

        if is_diagnosis_model:
            diagnosis_model_data = serializer.data
            feature_names = diagnosis_model_data.pop('feature_names')
            if isinstance(feature_names, str):
                feature_names = json.loads(feature_names)

            symptoms_obj = {symptom.name: symptom.category.name for symptom in Symptom.objects.all()}
            symptoms_data = {}
            for symptom_name in feature_names:
                category = symptoms_obj.get(symptom_name, "Other")
                if category:
                    if category not in symptoms_data:
                        symptoms_data[category] = []
                    symptoms_data[category].append(symptom_name)



            diagnosis_model_data['feature_names'] = symptoms_data
            return handle_response(data=diagnosis_model_data, status_code=200)
        else:
            return handle_response(data=serializer.data, status_code=200)

    except MachineLearningModel.DoesNotExist:
        return handle_response(error="Model not found", status_code=404)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return handle_response(error="An error occurred while fetching the model(s)", status_code=500)




@api_view(['GET'])
def models_list(request):
    return fetch_and_serialize_models(model_id="tdsevgg53h5f53e6", is_diagnosis_model=False)

@api_view(['GET'])
def get_diagnosis_model(request):
    return fetch_and_serialize_models(model_id="tdsevgg53h5f53e6", is_diagnosis_model=True)


#_______--------------------------------------------------------------------------------_______


def prepare_input_data(request_data, feature_names, feature_maps):
    input_data = {
        'data':[]
    }
    feature_map_dict = {feature: value_map for feature, value_map in feature_maps.items()}

    for feature in feature_names:
        raw_value = request_data.get(feature, None)
        if feature in feature_map_dict and raw_value in feature_map_dict[feature]:
            input_data['data'].append(feature_map_dict[feature][raw_value])
        else:
            input_data['data'].append(raw_value)  
    
    return input_data


def get_prediction_from_service(model_id, input_data):
    try:
        response = requests.post(f'http://localhost:8001/predict/{model_id}', json=input_data) 
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Request failed for model {model_id}: {str(e)}, Response: {response.text if 'response' in locals() else 'No response'}")
        raise  



@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_prediction(request):
    try:
        user = request.user
        model_id = request.data.get("model")
        if not model_id:
            logger.error("Model ID is missing from the request.")
            return handle_response(error="Model ID is required", status_code=400)

        model = get_object_or_404(MachineLearningModel, id=model_id)
        
        feature_names = json.loads(model.feature_names)
        feature_maps = json.loads(model.feature_maps)
        output_maps = json.loads(model.output_maps)

        input_data = prepare_input_data(request.data.get("data"), feature_names, feature_maps)
        input_data["model_id"] = model_id
        response_data = get_prediction_from_service(model_id, input_data)        
        
        prediction = response_data.get("prediction")
        probabilities = response_data.get("probabilities")
        
        mapped_prediction = {v: k for k, v in output_maps.items()}.get(prediction, "Unknown")
        class_probabilities = {class_label: round(prob * 100, 2) for class_label, prob in zip(output_maps.keys(), probabilities)}
         
        prediction_data = {
            "user": user.id,
            "model": model.id,
            "input_data": input_data,
            "prediction": mapped_prediction,
            "probability": class_probabilities  
        }
        
        serializer = PredictionSerializer(data=prediction_data)
        if serializer.is_valid():
            serializer.save()
            predicted_data = {
                "model": model_id,
                "prediction": mapped_prediction,
                "probability": class_probabilities
            }
            
            if model_id == "tdsevgg53h5f53e6":
                medications = Medication.objects.filter(diseases__name=mapped_prediction).values_list('name', flat=True)
                precautions = Precaution.objects.filter(diseases__name=mapped_prediction).values_list('name', flat=True)
                diets = Diet.objects.filter(diseases__name=mapped_prediction).values_list('name', flat=True)
                
                predicted_data['medications'] = medications
                predicted_data['precautions'] = precautions
                predicted_data['diets'] = diets
            
            return handle_response(predicted_data, status_code=200)
        else:
            logger.error(f"Failed to save prediction: {serializer.errors}")  # Log before return
            return handle_response(error=serializer.errors, status_code=400)

    except requests.RequestException as e:
        logger.error(f"Failed to get prediction: {e}")
        return handle_response(error="Failed to connect to FastAPI service or process data", status_code=500)

