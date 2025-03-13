from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.db.models import Prefetch
from django.contrib.auth.hashers import check_password


from rest_framework.authtoken.models import Token

from webapp.models import User
from webapp.serializers import UserSerializer, BiometricsEntrySerializer, FoodNutrientScoreSerializer
from webapp.models import BiometricsEntry, Biometrics, FoodNutrientScore

from .response_handler import ResponseHandler
from .cache_handler import CacheHandler

response_handler = ResponseHandler()
cache_handler = CacheHandler()

class UserHandler:
    
    def sign_up(self, requested_data):
        try:
            required_fields = {'first_name', 'last_name', 'password', 'gender', 'email'}
            missing_fields = required_fields - requested_data.keys()
            if missing_fields:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'], 
                    status_code=400, 
                    message=f"Missing required fields: {', '.join(missing_fields)}"
                )
            serialized_data = UserSerializer(data=requested_data)
            if not serialized_data.is_valid():
                return response_handler.handle_exception(
                    exception=f"Error creating user: {serialized_data.errors}",
                    error=response_handler.MESSAGES['USER_ALREADY_EXISTS'], 
                    status_code=400, 
                    message=response_handler.MESSAGES['USER_CREATION_FAILED']
                )
            
            user = serialized_data.save()
            token, _ = Token.objects.get_or_create(user=user)
            return self.get_user_data(
                user = user,
                token = token.key
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error creating user: {str(e)}", 
                status_code=400, 
                message=response_handler.MESSAGES['USER_CREATION_FAILED']
            )


    def authenticate_user(self, requested_data):
        email = requested_data.get('email')
        password = requested_data.get('password')
        if not email or not password:
            return response_handler.handle_exception(
                error=response_handler.MESSAGES['REQUIRED_FIELDS_MISSING'],
                status_code=401,
                message=response_handler.MESSAGES['EMAIL_PASSWORD_REQUIRED']
            )
        
        try:
            # First check if user exists before any authentication attempt
            user_exists = User.objects.filter(email=email).exists()
            if not user_exists:
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['INVALID_CREDENTIALS'],
                    status_code=401,
                    message=response_handler.MESSAGES['AUTHETICATION_FAILED']
                )
                
            # Then try cache
            cache_key = f"auth_{email}"
            cached_user = cache_handler.get_from_cache(cache_key)
            
            user = None
            if cached_user:
                if check_password(password, cached_user.password):
                    user = cached_user
            
            if not user:
                user = authenticate(username=email, password=password)
                if user and user.is_active:
                    cache_handler.set_to_cache(cache_key, user)

            if not user:
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['INVALID_CREDENTIALS'],
                    status_code=401,
                    message=response_handler.MESSAGES['AUTHETICATION_FAILED']
                )

            if not user.is_active:
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['ACCOUNT_DISABLED'],
                    status_code=401,
                    message=response_handler.MESSAGES['AUTHETICATION_FAILED']
                )
                
            user_data_cache_key = f"user_data_{user.id}"
            cached_user_data = cache_handler.get_from_cache(user_data_cache_key)
            if cached_user_data:
                if 'token' not in cached_user_data:
                    token_cache_key = f"token_{user.id}"
                    cached_token = cache_handler.get_from_cache(token_cache_key)
                    
                    if cached_token:
                        cached_user_data['token'] = cached_token
                    else:
                        token, _ = Token.objects.get_or_create(user=user)
                        cached_user_data['token'] = token.key
                        cache_handler.set_to_cache(token_cache_key, token.key)
                    
                    # Update the cache
                    cache_handler.set_to_cache(user_data_cache_key, cached_user_data)
                    
                return response_handler.handle_response(response=cached_user_data)
            
            # If not cached, get token and user data
            token_cache_key = f"token_{user.id}"
            cached_token = cache_handler.get_from_cache(token_cache_key)
            
            if cached_token:
                token_key = cached_token
            else:
                token, _ = Token.objects.get_or_create(user=user)
                token_key = token.key
                cache_handler.set_to_cache(token_cache_key, token_key)
            
            # Get minimal user data
            return self.get_user_data(
                user=user,
                token=token_key
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error authenticating user: {str(e)}",
                status_code=500,
                message=response_handler.MESSAGES['AUTHETICATION_FAILED']
            )
            
    def update_user(self, user, requested_data):
        try:
            serialized_data = UserSerializer(user, data=requested_data, partial=True)
            if not serialized_data.is_valid():
                return response_handler.handle_exception(
                    error=response_handler.MESSAGES['INVALID_DATA'],
                    status_code=400,
                    message=response_handler.MESSAGES['REQUEST_FAILED']
                )
            user_intance = serialized_data.save()
            return response_handler.handle_response(
                response=UserSerializer(user_intance).data
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error updating user: {str(e)}",
                
            )


    def logout_user(self, request):
        try:
            logout(request)
            return response_handler.handle_response(
                message=response_handler.MESSAGES['SUCCESS_MESSAGE'], 
                response=response_handler.MESSAGES['LOGOUT_SUCCESS']
            )  
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error logging out: {str(e)}"
            )
    
    def get_user_data(self, user, token=None, food_nutrients_score=None):
        try:
            has_biometrics = BiometricsEntry.objects.filter(user=user).exists()
            
            response_data = {
                "user": UserSerializer(user).data,
                "biometrics_entries": [],
                "food_nutrients_score": []
            }
            
            if token:
                response_data["token"] = token
            
            if has_biometrics:
                if food_nutrients_score is None:
                    response_data["food_nutrients_score"] = self.get_food_nutrients_score(user)
                else:
                    response_data["food_nutrients_score"] = food_nutrients_score
                    
                # Only get biometrics if they exist
                biometrics_entries = (
                    BiometricsEntry.objects.filter(user=user)
                    .only('id', 'health_score', 'created_at')
                    .prefetch_related(
                        Prefetch(
                            'biometrics',
                            queryset=Biometrics.objects.select_related(
                                'biochemical', 'biochemical__category'
                            ).only(
                                'id', 'value', 'scaled_value', 'is_hyper', 'expiry_date',
                                'biochemical__id', 'biochemical__name', 'biochemical__unit',
                                'biochemical__female_min', 'biochemical__female_max',
                                'biochemical__male_min', 'biochemical__male_max',
                                'biochemical__category__name'
                            )
                        )
                    )
                )
                
                serializer = BiometricsEntrySerializer(
                    biometrics_entries,
                    many=True, 
                    context={'gender': user.gender}
                )
                
                response_data["biometrics_entries"] = serializer.data

            return response_handler.handle_response(
                response=response_data
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error getting user data: {str(e)}"
            )
            
    def get_food_nutrients_score(self, user):
        latest_biometrics_entry = BiometricsEntry.objects.filter(user=user).order_by('-created_at').first()
        
        if not latest_biometrics_entry:
            return []

        food_nutrient_score = FoodNutrientScore.objects.filter(biometricsentry=latest_biometrics_entry).first()

        if not food_nutrient_score:
            return []

        serializer = FoodNutrientScoreSerializer(food_nutrient_score)

        return serializer.data  

            
    

        
