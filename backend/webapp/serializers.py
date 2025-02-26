from rest_framework import serializers

from .models import User, BiometricsEntry, Biometrics
from adminpanel.models import Biochemical

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 
                 'date_of_birth', 'height_cm', 'weight_kg', 'gender')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'gender': {'required': True},
            'date_of_birth': {'required': False},
            'height_cm': {'required': False},
            'weight_kg': {'required': False}
            
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    

class BiometricsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source='biochemical.name', 
        read_only=True
    )
    category = serializers.CharField(
        source='biochemical.category.name', 
        read_only=True
    )
    id = serializers.IntegerField(
        source='biochemical.id', 
        read_only=True
    )
    health_weight = serializers.FloatField(
        write_only=True
    )
    biochemical = serializers.PrimaryKeyRelatedField(
        queryset=Biochemical.objects.all(),
        write_only=True
    )
    biometricsentry = serializers.PrimaryKeyRelatedField(
        queryset=BiometricsEntry.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Biometrics
        fields = (
            'id',
            'biochemical',        
            'biometricsentry',  
            'health_weight',  
            'name',
            'category',   
            'value',
            'scaled_value',
            'is_hyper',
            'expiry_date'
        )

class BiometricsEntrySerializer(serializers.ModelSerializer):
    biometrics = BiometricsSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = BiometricsEntry
        fields = ('created_at', 'user', 'health_score', 'biometrics')


        
