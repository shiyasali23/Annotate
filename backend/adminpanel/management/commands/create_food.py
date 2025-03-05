
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from adminpanel.models import Food, Category, SubCategory, Nutrient, FoodNutrient

import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create food nutrients from CSV file'

    def handle(self, *args, **kwargs):
        try:
            nutrients_categories = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/nutrients_categories.csv"))
            food_nutrients = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/food_nutrients.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading nutrients_categories CSV file: {e}"))
            sys.exit(1)  


#--------------------------Nutrients Creation ------------------

        try:
            with transaction.atomic():
                for index, row in nutrients_categories.iterrows():
                    category, created = Category.objects.get_or_create(name=row['category'])
                    nutrient, _ = Nutrient.objects.get_or_create(
                        name=row['name'],
                        category=category,
                        unit=row.get('unit')
                    )

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating nutrients categories: {e}"))
            sys.exit(1)  
        
        self.stdout.write(self.style.SUCCESS("Nutrients categories data imported successfully."))


#-----------------------Food Object Creation-----------------------------
        
        try:
            with transaction.atomic():
                for index, row in food_nutrients.iterrows():
                    food_name = row['name']
                    category_name = row['category']
                    subcategory_name = row['sub_category']
                    
                    category, _ = Category.objects.get_or_create(name=category_name)
                    subcategory, _ = SubCategory.objects.get_or_create(name=subcategory_name, category=category)
                    
                    food, created = Food.objects.get_or_create(
                        name=food_name,
                        subcategory=subcategory,
                        nutriscore=row['nutriscore'] 
                    )
                    
                    for nutrient_name in food_nutrients.columns[3:-1]:
                        nutrient_value = row[nutrient_name]
                        if pd.notnull(nutrient_value):
                            try:
                                nutrient, _ = Nutrient.objects.get_or_create(name=nutrient_name)
                                FoodNutrient.objects.create(
                                    food=food,
                                    nutrient=nutrient,
                                    value=nutrient_value
                                )
                            except Nutrient.DoesNotExist:
                                self.stderr.write(self.style.ERROR(f"Error food nutrient: '{nutrient_name}' not found in the database."))
                                continue

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating food: {e}"))
            sys.exit(1)  

        self.stdout.write(self.style.SUCCESS("Food nutrients data import completed successfully."))
