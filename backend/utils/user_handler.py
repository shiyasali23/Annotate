from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from rest_framework.authtoken.models import Token

from webapp.serializers import UserSerializer
from .response_handler import ResponseHandler

response_handler = ResponseHandler()

class UserHandler:
    
    def sign_up(self, **extra_fields):
        try:
            required_fields = ['first_name', 'last_name', 'password', 'date_of_birth', 'height_cm', 'weight_kg', 'gender', 'email']
            missing_fields = [field for field in required_fields if field not in extra_fields]
            
            if missing_fields:
                missing_fields_str = ', '.join(missing_fields)
                return response_handler.handle_exception(error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'], status_code=400, message=f'Missing required fields: {missing_fields_str}')
            print(f"user created with {extra_fields}")
            serialized_data = UserSerializer(data=extra_fields)
            if serialized_data.is_valid():
                user = serialized_data.save()
                return response_handler.handle_response(response=UserSerializer(user).data, message='User created successfully.')
            else:
                return response_handler.handle_exception(exception=serialized_data.errors, status_code=400, message=response_handler.MESSAGES['USER_CREATION_FAILED'])
        
        
        except Exception as e:
            return response_handler.handle_exception(exception=f"Error creating user: {str(e)}")

    def authenticate_user(self, email=None, password=None):
        
        if not email or not password:
            return response_handler.handle_exception(error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'],status_code=401,message=response_handler.MESSAGES['EMAIL_PASSWORD_REQUIRED'])
        try:
            print(f"user authenticate with:-email{email}, password:{password}")
            user = authenticate(username=email, password=password)
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                return response_handler.handle_response(response={"token": token.key}, status_code=200,message=response_handler.MESSAGES['AUTHETICATION_SUCCESS'])
            else:
                return response_handler.handle_exception(error=response_handler.MESSAGES['INVALID_CREDENTIALS'], status_code=401, message=response_handler.MESSAGES['AUTHETICATION_FAILED'])
        except Exception as e:
            return response_handler.handle_exception(exception=f"Error authenticating user: {str(e)}")


    def logout_user(self, request):
        try:
            logout(request)
            return response_handler.handle_response(message=response_handler.MESSAGES['SUCCESS_MESSAGE'], response=response_handler.MESSAGES['LOGOUT_SUCCESS'])  
        except Exception as e:
            return response_handler.handle_exception(exception=f"Error logging out: {str(e)}")
