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
    biometrics_handler = BiometricsHandler()
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


@api_view(['POST', 'GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def handle_biometrics(request):
    biometrics_handler = BiometricsHandler()
    try:
        if request.method == 'POST':
            return biometrics_handler.handle_biometrics(
                user=request.user, 
                requested_data=request.data['data']
            )
        
        if request.method == 'GET':
            return user_handler.get_user_data(
                user=request.user,
                user_data=False
            )
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling biometrics view: {str(e)}"
        )


#------------------------Food Scores------------------------


@api_view(['POST', 'GET'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def handle_food_score(request):
    food_score_handler = FoodScoreHandler()
    try:
        if request.method == 'POST':
            return food_score_handler.create_food_scores(
                user=request.user, 
            )
        
        if request.method == 'GET':
            return user_handler.get_food_scores(
                user=request.user,
            )
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling biometrics view: {str(e)}"
        )
        
        
