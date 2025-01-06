from rest_framework import serializers
from .models import User, Biometrics, BiometricsEntry, FoodScore
from adminpanel.serializers import BiochemicalSerializer, FoodSerializer
from adminpanel.models import Biochemical, Food, FoodWeight, NutrientWeight, FoodNutrient
from django.contrib.auth import authenticate
from django.db import transaction, IntegrityError
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number', 'city', 'address',
            'job', 'date_of_birth', 'height_cm', 'weight_kg', 'gender', 'is_active', 'password'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
        



class BiometricsEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    biometrics = serializers.ListField(child=serializers.DictField(), write_only=True)

    class Meta:
        model = BiometricsEntry
        fields = ['id', 'user', 'health_score', 'created', 'biometrics']

    def create(self, validated_data):
        user = self.context['user']
        biometrics_data = validated_data.pop('biometrics')
        
        try:
            with transaction.atomic():
                # Create the BiometricsEntry instance
                biometrics_entry = BiometricsEntry.objects.create(user=user, **validated_data)
                
                # Create Biochemical entries
                for data in biometrics_data:
                    biochemical = Biochemical.objects.get(id=data['biochemical_id'])
                    Biometrics.objects.create(
                        biochemical=biochemical,
                        biometricsentry=biometrics_entry,
                        value=data['value']
                    )
                
                # Update health score and food scores
                self.update_health_score(biometrics_entry)
                
                return biometrics_entry
        
        except IntegrityError as e:
            # Handle database integrity errors
            print(f"IntegrityError occurred: {e}")
            raise serializers.ValidationError("A database integrity error occurred.")
        
        except Exception as e:
            # Handle any other exceptions
            print(f"An error occurred: {e}")
            raise serializers.ValidationError("An error occurred while processing the data.")

    def update_health_score(self, biometrics_entry):
        try:
            current_time = timezone.now()

            # Get distinct biochemicals across all biometrics for this user
            unique_biochemicals = (
                Biometrics.objects.filter(biometricsentry__user=biometrics_entry.user)
                .values_list('biochemical', flat=True)
                .distinct()
            )

            # Retrieve all biometrics for the unique biochemicals
            biometrics_queryset = (
                Biometrics.objects.filter(
                    biochemical__in=unique_biochemicals,
                    biometricsentry__user=biometrics_entry.user,
                    expired_date__gt=current_time
                )
                .order_by('biochemical', '-created')
            )

            # Keep track of the latest biometrics for each biochemical
            latest_biometrics = {}
            latest_health_weights = {}
            for bio in biometrics_queryset:
                if bio.biochemical not in latest_biometrics:
                    latest_biometrics[bio.biochemical] = bio.scaled_value
                    latest_health_weights[bio.biochemical] = bio.health_weight

            total_score = sum(latest_health_weights.values())

            biometrics_entry.health_score = total_score
            self.update_food_score(latest_biometrics, biometrics_entry)
            biometrics_entry.save()
        
        except Exception as e:
            print(f"An error occurred while updating health score: {e}")
            raise

    def update_food_score(self, latest_biometrics, biometrics_entry):
        food_bias_weights = []
        nutrient_bias_weights = []
        food_weights_obj = FoodWeight.objects.all()
        nutrient_weights_obj = NutrientWeight.objects.all()

        try:
            # Process biochemicals and their corresponding weights and biases
            for biochemical, scaled_value in latest_biometrics.items():
                food_weights = food_weights_obj.filter(biochemical=biochemical)
                for food_weight in food_weights:
                    food_bias_weights.append({food_weight.food: (food_weight.weight * scaled_value) * -1})
                    food_bias_weights.append({food_weight.food: (food_weight.bias * scaled_value) * -1})

                nutrient_weights = nutrient_weights_obj.filter(biochemical=biochemical)
                for nutrient_weight in nutrient_weights:
                    nutrient_bias_weights.append({nutrient_weight.nutrient: (nutrient_weight.bias * scaled_value) * -1})
                    nutrient_bias_weights.append({nutrient_weight.nutrient: (nutrient_weight.weight * scaled_value) * -1})

            # Calculate total bias weights
            total_food_bias_weights = self.add_values(food_bias_weights)
            total_nutrients_bias_weights = self.add_values(nutrient_bias_weights)

            # Calculate food nutrient sums
            food_nutrients_obj = FoodNutrient.objects.all()
            food_nutrient_sum = {}
            for food in total_food_bias_weights.keys():
                food_nutrient_sum[food] = 0
                food_nutrients = food_nutrients_obj.filter(food=food)
                for food_nutrient in food_nutrients:
                    nutrient = food_nutrient.nutrient
                    food_nutrient_sum[food] += food_nutrient.normalized_value * total_nutrients_bias_weights.get(nutrient)

            # Normalize the nutrient sum and total food bias weights
            scaled_nutrient_sum = self.normalize_columns(food_nutrient_sum)
            scaled_total_food_bias_weights = self.normalize_columns(total_food_bias_weights)
            
            # Normalize the `normalized_nutriscore` for all foods
            foods = Food.objects.all()
            normalized_nutriscore = {food: food.normalized_nutriscore for food in foods}
            
            food_score = {}

            for food in foods:
                food_key = food  
                food_score[food_key] = (
                    scaled_total_food_bias_weights.get(food_key, 0) + 
                    scaled_nutrient_sum.get(food_key, 0)
                ) + normalized_nutriscore.get(food_key, 0)
            
            # Create FoodScore entries
            self.create_food_scores(food_score, biometrics_entry)
        
        except Exception as e:
            print(f"An error occurred while updating food scores: {e}")
            raise

    def create_food_scores(self, food_score, biometrics_entry):
        try:
            food_scores = []
            for food, score in food_score.items():
                food_scores.append(FoodScore(
                    biometricsentry=biometrics_entry,
                    food=food,
                    score=score
                ))

            # Bulk create FoodScore instances
            FoodScore.objects.bulk_create(food_scores)
        
        except Exception as e:
            print(f"An error occurred while creating FoodScore entries: {e}")
            raise

    def add_values(self, data):
        # Use a dictionary to accumulate values
        merged_dict = {}
        for item in data:
            for key, value in item.items():
                merged_dict[key] = merged_dict.get(key, 0) + value
        
        return merged_dict

    def normalize_columns(self, data_dict):
        min_val = min(data_dict.values())
        max_val = max(data_dict.values())
        normalized_dict = {k: (v - min_val) / (max_val - min_val) for k, v in data_dict.items()}
        return normalized_dict


        
class BiometricsSerializer(serializers.ModelSerializer):
    biochemical_id = serializers.PrimaryKeyRelatedField(queryset=Biochemical.objects.all(), source='biochemical')
    biochemical = BiochemicalSerializer(read_only=True)

    class Meta:
        model = Biometrics
        fields = [
            'id', 'biochemical', 'biochemical_id', 'value',
            'scaled_value', 'expired_date', 'created'
        ]



class FoodScoreSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    sub_category = serializers.SerializerMethodField()

    class Meta:
        model = FoodScore
        fields = [
             'category','sub_category' ,'name' ,'score', 
        ]

    def get_name(self, obj):
        return obj.food.name if obj.food else None

    def get_category(self, obj):
        return obj.food.subcategory.category.name if obj.food and obj.food.subcategory.category else None
    
    def get_sub_category(self, obj):
        return obj.food.subcategory.name if obj.food and obj.food.subcategory else None
    