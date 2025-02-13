from .response_handler import ResponseHandler

response_handler = ResponseHandler()

class ObjectsHandler:
    def get_all_objects(self, model, serializer_class, prefetch_related_fields=None):
        try:
            queryset = model.objects.all()
            if prefetch_related_fields:
                queryset = queryset.prefetch_related(*prefetch_related_fields)

            if not queryset.exists():
                return response_handler.handle_exception(error=response_handler.MESSAGES['NOT_FOUND'], status_code=404, message=f"{model.__name__} not found")

            serializer = serializer_class(queryset, many=True)
            return response_handler.handle_response(response=serializer.data)
        
        except Exception as e:
            return response_handler.handle_exception(exception=f"Error fetching all {model.__name__}: {str(e)}")
            
