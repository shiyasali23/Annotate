from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.db.models import Prefetch

from rest_framework.authtoken.models import Token

from webapp.models import User
from webapp.serializers import UserSerializer, BiometricsEntrySerializer
from webapp.models import BiometricsEntry, FoodScore, Biometrics
from .response_handler import ResponseHandler

response_handler = ResponseHandler()

class UserHandler:
    
    def sign_up(self, requested_data):
        try:
            required_fields = {'first_name', 'last_name', 'password', 'gender', 'email'}
            missing_fields = required_fields - requested_data.keys()
            if missing_fields:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'], 
                    status_code=400, 
                    message=f"Missing required fields: {', '.join(missing_fields)}"
                )
            serialized_data = UserSerializer(data=requested_data)
            if not serialized_data.is_valid():
                return response_handler.handle_exception(
                    exception=f"Error creating user: {serialized_data.errors}",
                    error=response_handler.MESSAGES['USER_ALREADY_EXISTS'], 
                    status_code=400, 
                    message=response_handler.MESSAGES['USER_CREATION_FAILED']
                )
            
            user = serialized_data.save()
            token, _ = Token.objects.get_or_create(user=user)
            return self.get_user_data(
                user = user,
                token = token.key
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating user: {str(e)}", 
                status_code=400, 
                message=response_handler.MESSAGES['USER_CREATION_FAILED']
            )


    def authenticate_user(self, requested_data):
        email = requested_data.get('email')
        password = requested_data.get('password')
        if not email or not password:
            return response_handler.handle_exception(
                error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'],
                status_code=401,
                message=response_handler.MESSAGES['EMAIL_PASSWORD_REQUIRED']
            )
                        
        try:
            user = authenticate(username=email, password=password)
            if not user:
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['INVALID_CREDENTIALS'],
                    status_code=401,
                    message=response_handler.MESSAGES['AUTHETICATION_FAILED']
                )

            if not user.is_active:
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['ACCOUNT_DISABLED'],
                    status_code=401,
                    message=response_handler.MESSAGES['AUTHETICATION_FAILED']
                )

            token, _ = Token.objects.get_or_create(user=user)
            return self.get_user_data(
                user = user,
                token = token.key
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error authenticating user: {str(e)}",
                status_code=500,
                message=response_handler.MESSAGES['AUTHETICATION_FAILED']
            )
            
    def update_user(self, user, requested_data):
        try:
            serialized_data = UserSerializer(user, data=requested_data, partial=True)
            if not serialized_data.is_valid():
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['INVALID_DATA'],
                    status_code=400,
                    message=response_handler.MESSAGES['REQUEST_FAILED']
                )
            user_intance = serialized_data.save()
            return response_handler.handle_response(
                response=UserSerializer(user_intance).data
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error updating user: {str(e)}",
                
            )


    def logout_user(self, request):
        try:
            logout(request)
            return response_handler.handle_response(
                message=response_handler.MESSAGES['SUCCESS_MESSAGE'], 
                response=response_handler.MESSAGES['LOGOUT_SUCCESS']
            )  
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error logging out: {str(e)}"
            )
    
    def get_user_data(self, user, token=None, user_data=True):
        try:
            biometrics_entries = (
                BiometricsEntry.objects.filter(user=user)
                .only('id', 'health_score', 'created_at')  
                .prefetch_related(
                    Prefetch(
                        'biometrics',
                        queryset=Biometrics.objects.select_related(
                            'biochemical', 'biochemical__category'
                        ).only(
                            'id', 
                            'value', 
                            'scaled_value', 
                            'is_hyper', 
                            'expiry_date',
                            'biochemical__id',
                            'biochemical__name',
                            'biochemical__unit',
                            'biochemical__female_min',
                            'biochemical__female_max',
                            'biochemical__male_min',
                            'biochemical__male_max',
                            'biochemical__category__name'
                        )
                    )
                )
            )
            serializer = BiometricsEntrySerializer(
                biometrics_entries,
                many=True, 
                context={'gender': user.gender}
            )
            
            response_data = {
                "biometrics_entries": serializer.data, 
            }
            
            if user_data:
                response_data["user"] = UserSerializer(user).data
            
            if token:
                response_data["token"] = token  

            return response_handler.handle_response(
                response=response_data
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting user data: {str(e)}"
            )
            
    

        
