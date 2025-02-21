from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rest_framework import  authentication, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler
from utils.biometrics_handler import BiometricsHandler

user_handler = UserHandler()
response_handler = ResponseHandler()
biometrics_handler = BiometricsHandler()


#------------------------Authentication------------------------

@api_view(['POST'])
def signup(request):
    try:
        return user_handler.sign_up(**request.data) 
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error creating user: {str(e)}")

@api_view(['POST'])
def authenticate(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        return user_handler.authenticate_user(email=email, password=password)
        
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error authenticating user: {str(e)}")

#------------------------Biometrics------------------------

@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def biometrics_view(request):
    try:
        return biometrics_handler.handle_biometrics(user=request.user, requested_data=request.data['data'])
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error handling biometrics: {str(e)}")