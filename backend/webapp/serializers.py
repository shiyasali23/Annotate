from rest_framework import serializers

from .models import User, BiometricsEntry, Biometrics, FoodsScore

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
    
    unit = serializers.CharField(
        source='biochemical.unit', 
        read_only=True
    )
    
    female_min = serializers.FloatField(
        source='biochemical.female_min', 
        read_only=True
    )
    female_max = serializers.FloatField(
        source='biochemical.female_max', 
        read_only=True
    )
    male_min = serializers.FloatField(
        source='biochemical.male_min', 
        read_only=True
    )
    male_max = serializers.FloatField(
        source='biochemical.male_max', 
        read_only=True
    )
    
    
    class Meta:
        model = Biometrics
        fields = (
            'biochemical',        
            'biometricsentry',  
            'health_weight',
            
            'id',  
            'name',
            'category',  
            'unit',
            'female_min',
            'female_max',
            'male_min',
            'male_max',
          
            'is_hyper',
            'expiry_date',
            'value',
            'scaled_value',
            
        )
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        gender = self.context.get('gender')
        
        if gender == 'female':
            healthy_min = representation.get('female_min')
            healthy_max = representation.get('female_max')
        else:
            healthy_min = representation.get('male_min')
            healthy_max = representation.get('male_max')
        
        # Add new keys with the healthy values
        representation['healthy_min'] = healthy_min
        representation['healthy_max'] = healthy_max
        
        # Optionally remove the original gender-specific fields
        representation.pop('female_min', None)
        representation.pop('female_max', None)
        representation.pop('male_min', None)
        representation.pop('male_max', None)
        
        return representation

class BiometricsEntrySerializer(serializers.ModelSerializer):
    biometrics = BiometricsSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    
    biometrics_entry_id = serializers.IntegerField(
        source='id', 
        read_only=True
    )
    
    class Meta:
        model = BiometricsEntry
        fields = ('biometrics_entry_id', 'created_at', 'user', 'health_score', 'biometrics')

class FoodsScoreSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(
        write_only=True,
        required=False
    )
    uuid = serializers.UUIDField(
        write_only=True,
        required=False
    )
    created_at = serializers.DateTimeField(
        write_only=True,
        required=False
    )
    updated_at = serializers.DateTimeField(
        write_only=True,
        required=False
    )

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = FoodsScore
        fields = ['id', 'uuid', 'created_at', 'updated_at', 'user', 'foods_score']
        
    


        