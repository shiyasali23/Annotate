from rest_framework import serializers
from .models import BiochemicalCondition, Biochemical




class BiochemicalSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Biochemical
        fields = ['id', 'name', 'category_name']

