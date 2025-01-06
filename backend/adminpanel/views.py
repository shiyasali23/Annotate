from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    Category, SubCategory, Biochemical, Condition, Food, Nutrient, 
    FoodNutrient, FoodWeight, NutrientWeight, BiochemicalCondition
)

from .serializers import (
    CategorySerializer, SubCategorySerializer, BiochemicalSerializer,
    ConditionSerializer, FoodSerializer, NutrientSerializer,
    FoodNutrientSerializer, FoodWeightSerializer, NutrientWeightSerializer,
    BiochemicalConditionSerializer
)

import logging
logger = logging.getLogger(__name__)


# Generic views for list and detail
def generic_list_view(request, model, serializer_class):
    if request.method == 'GET':
        objects = model.objects.all()
        serializer = serializer_class(objects, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def biochemical_list(request):
    return generic_list_view(request, Biochemical, BiochemicalSerializer)


@api_view(['GET'])
def condition_list(request):
    return generic_list_view(request, Condition, ConditionSerializer)

@api_view(['GET'])
def food_list(request):
        objects = Food.objects.select_related('subcategory').prefetch_related('nutrients__nutrient', 'nutrients__nutrient__category').all()
        serializer = FoodSerializer(objects, many=True)
        return Response(serializer.data)



