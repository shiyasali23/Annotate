import logging
from rest_framework import status, authentication, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch, Max
from django.utils import timezone

from .models import User, Biometrics, FoodScore, BiometricsEntry
from adminpanel.models import Biochemical, BiochemicalCondition
from adminpanel.serializers import BiochemicalSerializer, BiochemicalConditionSerializer
from mlmodels.views import handle_response
from .serializers import UserSerializer, BiometricsSerializer, FoodScoreSerializer, BiometricsEntrySerializer

logger = logging.getLogger(__name__)

def get_token_from_request(request):
    token_key = request.headers.get('Authorization', '').split(' ')[-1]
    return get_object_or_404(Token, key=token_key)

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


# ------------------------------------------------------------------------------
def fetch_user_data(user):
    try:
        biometrics_data_list = []
        latest_biometrics_data = []
        health_scores_data = []
        conditions = set()
        food_scores = []

        biometrics_entries = BiometricsEntry.objects.filter(user=user)
        biochemicals = Biochemical.objects.prefetch_related(
            Prefetch(
                'biometrics',
                queryset=Biometrics.objects.filter(biometricsentry__user=user).order_by('biochemical_id', 'created'),
                to_attr='user_biometrics'
            )
        )

        if biometrics_entries.exists():
            latest_entry = biometrics_entries.latest('created')
            biometrics = Biometrics.objects.filter(biometricsentry__user=user)
            food_scores = FoodScore.objects.filter(biometricsentry=latest_entry)

            biometrics_data_dict = {}

            # Process each biometric data for the user
            for biometric in biometrics:
                bio_name = biometric.biochemical.name

                if bio_name not in biometrics_data_dict:
                    biometrics_data_dict[bio_name] = {
                        'values': [],
                        'healthy_min': (
                            biometric.biochemical.female_min if user.gender == 'female'
                            else biometric.biochemical.male_min
                        ),
                        'healthy_max': (
                            biometric.biochemical.female_max if user.gender == 'female'
                            else biometric.biochemical.male_max
                        ),
                        'category': biometric.biochemical.category.name,
                    }

                biometrics_data_dict[bio_name]['values'].append({
                    'value': biometric.value,
                    'scaled_value': biometric.scaled_value,
                    'expired_date': biometric.expired_date,
                    'created': biometric.biometricsentry.created
                })

            # Convert the dictionary to the desired list format
            biometrics_data_list = [{name: data} for name, data in biometrics_data_dict.items()]

            # Process health scores data
            health_scores_data = [
                {
                    'id': entry.id,
                    'health_score': entry.health_score,
                    'created': entry.created,
                }
                for entry in biometrics_entries
            ]

        else:
            # No biometrics entries, provide all biochemicals with placeholder values
            biometrics_data_list = []
            food_scores = []

        # Process all biochemicals, filling in with either latest values or None
        time_now = timezone.now()
        for biochemical in biochemicals:
            if biochemical.user_biometrics:
                latest_biometric = biochemical.user_biometrics[-1]
                latest_biometrics_data.append({
                    'biochemical': {
                        'name': biochemical.name,
                        'id': biochemical.id,
                        'category': biochemical.category.name,
                    },
                    'value': latest_biometric.value,
                    'scaled_value': latest_biometric.scaled_value,
                    'expired_date': latest_biometric.expired_date,
                })

                if latest_biometric.expired_date is not None and latest_biometric.expired_date > time_now:
                    if latest_biometric.scaled_value < -1:
                        conditions.update(
                            BiochemicalCondition.objects.filter(
                                biochemical=biochemical,
                                is_hyper=False
                            ).values_list('condition__name', flat=True)
                        )
                    elif latest_biometric.scaled_value > 1:
                        conditions.update(
                            BiochemicalCondition.objects.filter(
                                biochemical=biochemical,
                                is_hyper=True
                            ).values_list('condition__name', flat=True)
                        )
            else:
                latest_biometrics_data.append({
                    'biochemical': {
                        'name': biochemical.name,
                        'id': biochemical.id,
                        'category': biochemical.category.name,
                    },
                    'value': None,
                    'scaled_value': None,
                    'expired_date': None,
                })

        return {
            'user': UserSerializer(user).data,
            'biometrics': biometrics_data_list,
            'food_scores': FoodScoreSerializer(food_scores, many=True).data,
            'health_score': health_scores_data,
            'conditions': list(conditions),
            'latest_biometrics': latest_biometrics_data,
        }, None

    except Exception as exc:
        logger.exception(f"Error fetching user biometrics entry details: {exc}")
        return None, 'Error fetching user biometrics entry details.'

# ------------------------------------------------------------------------------



@api_view(['GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_user(request):
    try:
        response_data, error = fetch_user_data(request.user)
        if error:
            return handle_response(error=error, status_code=status.HTTP_404_NOT_FOUND)
        return handle_response(response_data)
    except Exception as exc:
        return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ------------------------------------------------------------------------------

@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        token = get_token_from_request(request)
        token.delete()
        return handle_response({"detail": "Logout successful!"})
    except Exception as exc:
        return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def deactivate_user(request):
    try:
        token = get_token_from_request(request)
        user = token.user
        
        if user.is_active:
            user.is_active = False
            user.save()
            token.delete()
            return handle_response({'message': 'Account successfully deactivated.'})
        return handle_response(error='Account is already inactive.', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_user(request):
    try:
        token = get_token_from_request(request)
        user = token.user
        
        if user.is_active:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()               
                response_data = fetch_user_data(token.user)
                return handle_response(response_data)
            return handle_response(error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        return handle_response(error='Account is inactive.', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("Unexpected error in update_user")
        return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def create_biometrics(request):
    try:
        data = {'user': request.user.id, 'biometrics': request.data}
        serializer = BiometricsEntrySerializer(data=data, context={'user': request.user})
        if serializer.is_valid():
            biometrics_entry = serializer.save()
            response_data = fetch_user_data(request.user)
            return handle_response(response_data, status_code=status.HTTP_201_CREATED)
        return handle_response(error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------------------------------------------------------------


@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data={**request.data, 'is_active': True, 'is_staff': False})
    if serializer.is_valid():
        try:
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            response_data = {
                'token': token.key,
            }
            return handle_response(response_data, status_code=status.HTTP_201_CREATED)
        except Exception as exc:
            return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return handle_response(error=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    user = authenticate(email=request.data.get('email'), password=request.data.get('password'))
    if user and user.is_active:
        try:
            token, _ = Token.objects.get_or_create(user=user)
            response_data = {'token' : token.key}
            return handle_response(response_data)
        except Exception as exc:
            return handle_response(error=exc, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return handle_response(error='Invalid credentials.', status_code=status.HTTP_401_UNAUTHORIZED)





