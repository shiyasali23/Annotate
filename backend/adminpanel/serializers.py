from rest_framework import serializers
from .models import BiochemicalCondition, Biochemical, BiochemicalCondition, Condition




class BiochemicalViewSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Biochemical
        fields = ['id', 'name', 'category_name']

class BiochemicalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Biochemical
        fields = ['id', 'female_min', 'female_max', 'male_min', 'male_max', 'validity_days']

class BiochemicalConditionSerializer(serializers.ModelSerializer):
    
    name = serializers.CharField(
        source='condition.name', 
        read_only=True
    )
    
    condition = serializers.PrimaryKeyRelatedField(queryset=Condition.objects.all(), write_only=True)

    class Meta:
        model = BiochemicalCondition
        fields = ['name', 'is_hyper', 'biochemical', 'condition']

