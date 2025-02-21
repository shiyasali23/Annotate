from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from rest_framework.authtoken.models import Token

from webapp.models import User
from django.db.utils import IntegrityError


from webapp.serializers import UserSerializer
from .response_handler import ResponseHandler

response_handler = ResponseHandler()

class UserHandler:
    
    def sign_up(self, **extra_fields):
        try:
            required_fields = {'first_name', 'last_name', 'password', 'date_of_birth', 'height_cm', 'weight_kg', 'gender', 'email'}
            missing_fields = required_fields - extra_fields.keys()
            if missing_fields:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'], 
                    status_code=400, 
                    message=f"Missing required fields: {', '.join(missing_fields)}"
                )
            serialized_data = UserSerializer(data=extra_fields)
            if not serialized_data.is_valid():
                return response_handler.handle_exception(
                    exception=f"Error creating user: {serialized_data.errors}",
                    error=response_handler.MESSAGES['USER_ALREADY_EXISTS'], 
                    status_code=400, 
                    message=response_handler.MESSAGES['USER_CREATION_FAILED']
                )
            
            user = serialized_data.save()
            token, _ = Token.objects.get_or_create(user=user)
            return response_handler.handle_response(
                response=UserSerializer(user).data, 
                message='User created successfully.'
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating user: {str(e)}", 
                status_code=400, 
                message=response_handler.MESSAGES['USER_CREATION_FAILED']
            )


    def authenticate_user(self, email=None, password=None):
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
            return response_handler.handle_response(
                response={
                    "token": token.key,
                    "user": UserSerializer(user).data
                },
                status_code=200,
                message=response_handler.MESSAGES['AUTHETICATION_SUCCESS']
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error authenticating user: {str(e)}",
                status_code=500,
                message=response_handler.MESSAGES['AUTHETICATION_FAILED']
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
