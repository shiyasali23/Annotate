from django.contrib import admin
from .models import Category, SubCategory, Condition, Biochemical, BiochemicalCondition, Food, FoodImage, Nutrient, FoodNutrient, FoodWeight, NutrientWeight

# Register the models to the admin site
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(Condition)
admin.site.register(Biochemical)
admin.site.register(BiochemicalCondition)
admin.site.register(Food)
admin.site.register(FoodImage)
admin.site.register(Nutrient)
admin.site.register(FoodNutrient)
admin.site.register(FoodWeight)
admin.site.register(NutrientWeight)
