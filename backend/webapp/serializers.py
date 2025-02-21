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
            'date_of_birth': {'required': True},
            'height_cm': {'required': True},
            'weight_kg': {'required': True},
            'gender': {'required': True},
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    
from rest_framework import serializers
from adminpanel.models import Biochemical
from webapp.models import BiometricsEntry, Biometrics

class BiometricsSerializer(serializers.ModelSerializer):
    biochemical_name = serializers.CharField(source='biochemical.name', read_only=True)
    health_weight = serializers.FloatField(write_only=True)
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
            'biochemical',        
            'biometricsentry',    
            'biochemical_name',   
            'health_weight',
            'value',
            'scaled_value',
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


        
