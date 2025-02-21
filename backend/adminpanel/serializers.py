from rest_framework import serializers
from .models import BiochemicalCondition, Biochemical




class BiochemicalViewSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Biochemical
        fields = ['id', 'name', 'category_name']

class BiochemicalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Biochemical
        fields = ['id', 'female_min', 'female_max', 'male_min', 'male_max', 'validity_days']

