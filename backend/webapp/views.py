from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler

user_handler = UserHandler()
response_handler = ResponseHandler()

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
