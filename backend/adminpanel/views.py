from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Biochemical
from .serializers import BiochemicalSerializer

from utils.objects_handler import ObjectsHandler
from utils.cache_handler import CacheHandler
from utils.response_handler import ResponseHandler

objects_handler = ObjectsHandler()
cache_handler = CacheHandler()
response_handler = ResponseHandler()


@api_view(['GET'])
def handle_biochemicals(request):
    try:
        biochemicals, error = objects_handler.get_biochemicals(is_response=False)
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
