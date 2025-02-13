from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

from adminpanel.models import BaseModel


#------------------------------User---------------------------------

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.update({'is_staff': True, 'is_superuser': True})
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female')]
    
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    height_cm = models.FloatField(validators=[MinValueValidator(20.0), MaxValueValidator(300.0)], blank=True, null=True)
    weight_kg = models.FloatField(validators=[MinValueValidator(20.0), MaxValueValidator(300.0)], blank=True, null=True)
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, blank=True, null=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 

    class Meta:
        db_table = 'webapp_user'

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}' if self.first_name and self.last_name else self.email

    

#---------------------------Biometrics---------------------------------

class BiometricsEntry(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='biometrics_entries')
    health_score = models.FloatField()  
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()}'

class Biometrics(BaseModel):
    biochemical = models.ForeignKey('adminpanel.Biochemical', on_delete=models.CASCADE, related_name='biometrics')
    biometricsentry = models.ForeignKey(BiometricsEntry, on_delete=models.CASCADE, related_name='biometrics')
    value = models.FloatField()
    scaled_value = models.FloatField()  
    health_weight = models.FloatField()  
    expired_date = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=['biochemical']),
            models.Index(fields=['biometricsentry']),
        ]

    def __str__(self):
        return f'{self.biometricsentry.user.get_full_name()} - {self.biochemical.name} - {self.scaled_value}'

    def scale_biometrics(self, healthy_min, healthy_max, i):
        optimum_value = (healthy_min + healthy_max) / 2
        if healthy_min <= i <= healthy_max:
            return round(2 * (i - optimum_value) / (healthy_max - healthy_min), 2)
        elif i < healthy_min:
            return round((i - healthy_min), 2)
        elif i > healthy_max:
            return round((i - healthy_max), 2)

    def scale_health_score(self, healthy_min, healthy_max, i):
        optimum_value = (healthy_min + healthy_max) / 2
        if healthy_min <= i <= healthy_max:
            return round(1 - abs(2 * (i - optimum_value) / (healthy_max - healthy_min)), 2)
        elif i < healthy_min:
            return round((i - healthy_min), 2)
        elif i > healthy_max:
            return round((healthy_max - i), 2)

    def get_healthy_range(self, gender):
        if gender == 'female':
            return self.biochemical.female_min, self.biochemical.female_max
        return self.biochemical.male_min, self.biochemical.male_max

    def save(self, *args, **kwargs):
        if self.value is not None and self.biochemical:
            healthy_min, healthy_max = self.get_healthy_range(self.biometricsentry.user.gender)

            self.scaled_value = self.scale_biometrics(healthy_min, healthy_max, float(self.value))
            self.health_weight = self.scale_health_score(healthy_min, healthy_max, float(self.value))
            self.expired_date = timezone.now() + timedelta(days=self.biochemical.validity_days)
        else:
            self.scaled_value = None
            self.health_weight = None
            self.expired_date = None
        super().save(*args, **kwargs)

class FoodScore(BaseModel):
    biometricsentry = models.ForeignKey(BiometricsEntry, on_delete=models.CASCADE, related_name='food_scores')
    food = models.ForeignKey('adminpanel.Food', on_delete=models.CASCADE, related_name='food_scores')
    score = models.FloatField()

    class Meta:
        indexes = [
            models.Index(fields=['biometricsentry']),
            models.Index(fields=['food']),
        ]

    def __str__(self):
        return f'{self.biometricsentry.user.get_full_name()} - {self.food.name} - {self.score}'