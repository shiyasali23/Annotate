from rest_framework import serializers
from .models import BiochemicalCondition, Biochemical, BiochemicalCondition, Condition, Food, FoodNutrient




class BiochemicalViewSerializer(serializers.ModelSerializer):
    category = serializers.ReadOnlyField(source='category.name', read_only=True)

    class Meta:
        model = Biochemical
        fields = ['id', 'name', 'unit', 'category' ]

class BiochemicalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Biochemical
        fields = ['id', 'female_min', 'female_max', 'male_min', 'male_max', 'validity_days']
        


class BiochemicalConditionSerializer(serializers.ModelSerializer):
    
    name = serializers.CharField(
        source='condition.name', 
        read_only=True
    )
    
    id = serializers.IntegerField(
        source='biochemical.id', 
        read_only=True
    )
    
    biochemical = serializers.CharField(
        source='biochemical.name', 
        read_only=True
    )
    
    is_hyper = serializers.BooleanField()
    
    condition = serializers.PrimaryKeyRelatedField(queryset=Condition.objects.all(), write_only=True)

    class Meta:
        model = BiochemicalCondition
        fields = ['name', 'is_hyper', 'biochemical', 'id', 'condition']
        
        

class FoodNutrientSerializer(serializers.ModelSerializer):
    
    food = serializers.CharField(
        source='food.name', 
        read_only=True
    ) 
    
    nutriscore = serializers.FloatField(
        source='food.nutriscore', 
        read_only=True
    )
    
    nutrient = serializers.CharField(
        source='nutrient.name', 
        read_only=True
    )
    
    unit = serializers.CharField(
        source='nutrient.unit', 
        read_only=True
    )
    
    value = serializers.FloatField()
    
    class Meta:
        model = FoodNutrient
        fields = ["food", "nutriscore", "nutrient", "value", "unit"]