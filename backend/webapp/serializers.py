from rest_framework import serializers
from .models import User, BiometricsEntry, Biometrics

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
    
class BiometricsEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricsEntry
        fields = "__all__"
        
class BiometricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biometrics
        fields = "__all__"