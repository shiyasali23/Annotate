from rest_framework import serializers
from .models import Symptom


class SymptomSerializer(serializers.ModelSerializer):
    category= serializers.SerializerMethodField()  
    
    class Meta:
        model = Symptom
        fields = ['name', 'category']
        
    def get_category(self, obj):
        return obj.category.name


