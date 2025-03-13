from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from rest_framework import  authentication, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes

from utils.response_handler import ResponseHandler
from utils.user_handler import UserHandler
from utils.biometrics_handler import BiometricsHandler
from utils.food_score_handler import FoodScoreHandler

user_handler = UserHandler()
response_handler = ResponseHandler()



#------------------------Authentication------------------------

@api_view(['POST'])
def signup(request):
    try:
        return user_handler.sign_up(
            requested_data=request.data['data']
        ) 
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error creating user: {str(e)}")

@api_view(['POST'])
def authenticate(request):
    try:
        
        return user_handler.authenticate_user(
            requested_data=request.data['data']
        )
        
    except Exception as e:
        return response_handler.handle_exception(exception=f"Error authenticating user: {str(e)}")
    
#------------------------User------------------------
  
@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def handle_user(request):
    if not request.user.is_authenticated:
        return Response({"error": "User not authenticated"}, status=401)

    try:
        return user_handler.update_user(
            user=request.user, 
            requested_data=request.data['data'],
        )              
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling user update view: {str(e)}"
        )
    

#------------------------Biometrics------------------------


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def handle_biometrics(request):
    try:
        biometrics_handler = BiometricsHandler()
        return biometrics_handler.handle_biometrics(
            user=request.user, 
            requested_data=request.data['data']
        )                
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling biometrics view: {str(e)}"
        )





        
        
