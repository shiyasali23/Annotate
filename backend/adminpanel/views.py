from rest_framework.decorators import api_view
from rest_framework.response import Response


from utils.objects_handler import ObjectsHandler
from utils.cache_handler import CacheHandler
from utils.response_handler import ResponseHandler
from utils.conditions_handler import ConditionsHandler

objects_handler = ObjectsHandler()
cache_handler = CacheHandler()
response_handler = ResponseHandler()

#--------------------Biochemicals----------------------

@api_view(['GET'])
def handle_biochemicals(request):
    try:
        biochemicals, error = objects_handler.get_biochemicals()
        if error:
            return response_handler.handle_exception(
                exception=f"Error fetching biochemicals: {error}"
            )
        return response_handler.handle_response(
            response=biochemicals
        )
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling biochemicals view: {str(e)}"
        )

#--------------------Conditions----------------------


@api_view(['POST'])
def handle_conditions(request):
    try:
        conditions_handler = ConditionsHandler()
        return conditions_handler.get_conditions(
            requested_data=request.data['data']
        ) 
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling biometrics: {str(e)}"
        )
        
        
#--------------------Food Nutrients----------------------

@api_view(['GET'])
def handle_food_nutrients(request):
    try:
        food_nutrients, error = objects_handler.get_food_nutrients()
        if error:
            return response_handler.handle_exception(
                exception=f"Error fetching food nutrients: {error}"
            )
        return response_handler.handle_response(
            response=food_nutrients
        )
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error handling nutrients view: {str(e)}"
        )