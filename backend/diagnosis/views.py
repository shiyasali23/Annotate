from .models import Symptom
from .serializers import SymptomSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from adminpanel.views import generic_list_view

import logging

logger = logging.getLogger(__name__)




@api_view(['GET'])
def symptoms_list(request):
    return generic_list_view(request, Symptom, SymptomSerializer)