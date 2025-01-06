from django.contrib import admin
from .models import User, BiometricsEntry, Biometrics, FoodScore

# Register the models
admin.site.register(User)
admin.site.register(BiometricsEntry)
admin.site.register(Biometrics)
admin.site.register(FoodScore)
