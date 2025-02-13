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
        cache_key = 'biochemicals_data'
        cached_biochemicals = cache_handler.get_from_cache(cache_key)

        if not cached_biochemicals:
            response = objects_handler.get_all_objects(
                model=Biochemical, 
                serializer_class=BiochemicalSerializer,           
                prefetch_related_fields=['category']
            )

            if response.status_code == 200:
                cache_handler.set_to_cache(cache_key, response.data)  

            return response  

        return response_handler.handle_response(response=cached_biochemicals)  

    except Exception as e:
        return response_handler.handle_exception(exception=f"Error handling biochemicals: {str(e)}")
