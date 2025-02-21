from adminpanel.models import Biochemical
from adminpanel.serializers import BiochemicalSerializer, BiochemicalViewSerializer

from .response_handler import ResponseHandler
from .cache_handler import CacheHandler
import logging

logger = logging.getLogger(__name__)
response_handler = ResponseHandler()
cache_handler = CacheHandler()

class ObjectsHandler:
    
    def get_all_objects(self, model, serializer_class=None, prefetch_related_fields=None):
        try:
            queryset = model.objects.all()
            if prefetch_related_fields:
                queryset = queryset.prefetch_related(*prefetch_related_fields)

            if not queryset.exists():
                error_msg = f"No {model.__name__} found."
                logger.warning(error_msg)
                raise ValueError(error_msg)

            serializer = serializer_class(queryset, many=True)
            return serializer.data, None
        
        except Exception as e:
            logger.error(f"Error fetching all {model.__name__}: {e}", exc_info=True)
            return None, e
        
    def get_biochemicals(self, is_response=True):
        cache_key = 'biochemicals_view' if is_response else 'biochemicals_data'
        try:
            cached_data = cache_handler.get_from_cache(cache_key)
            if cached_data is not None:
                return cached_data, None
            data, error = self.get_all_objects(
                model=Biochemical, 
                serializer_class=BiochemicalViewSerializer if is_response else BiochemicalSerializer,           
                prefetch_related_fields=['category']
            )
            if error:
                return None, error

            cache_handler.set_to_cache(cache_key, data)
            return data, None
             
        except Exception as e:
            logger.error(f"Error fetching biochemicals ha ha: {e}", exc_info=True)
            return None, e

         
            
            
