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
        error = "Error creating food nutrients"  

        try:
            nutrients_categories = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/nutrients_categories.csv"))
            food_nutrients = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/food_nutrients.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: reading CSV files: {e}"))
            sys.exit(1)

        # -------------------------- Nutrients Creation -------------------
        nutrient_dict = {}  # Cache for Nutrient objects to avoid repeated DB queries

        try:
            with transaction.atomic():
                for index, row in nutrients_categories.iterrows():
                    category, _ = Category.objects.get_or_create(name=row['category'])

                    # Cache the Nutrient object to avoid multiple database queries for the same nutrient
                    nutrient_name = row['name']
                    if nutrient_name not in nutrient_dict:
                        nutrient, _ = Nutrient.objects.get_or_create(
                            name=nutrient_name,
                            category=category,
                            unit=row.get('unit')
                        )
                        nutrient_dict[nutrient_name] = nutrient  # Cache nutrient for future use
                    else:
                        nutrient = nutrient_dict[nutrient_name]  # Get cached nutrient

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: Error creating nutrients categories: {e}"))
            sys.exit(1)
        
        self.stdout.write(self.style.SUCCESS("Nutrients categories data imported successfully."))

        # ----------------------- Food Object Creation --------------------
        self.stdout.write(self.style.NOTICE('Food nutrients data creating...'))
        food_dict = {}  # Cache for Food objects to avoid repeated DB queries
        subcategory_dict = {}  # Cache for SubCategory objects

        food_nutrients_to_create = []  # List for bulk creation of FoodNutrient objects

        try:
            with transaction.atomic():
                for index, row in food_nutrients.iterrows():
                    food_name = row['name']
                    category_name = row['category']
                    subcategory_name = row['sub_category']

                    # Cache Category object
                    category = Category.objects.get_or_create(name=category_name)[0]

                    # Cache SubCategory object
                    if subcategory_name not in subcategory_dict:
                        subcategory = SubCategory.objects.get_or_create(name=subcategory_name, category=category)[0]
                        subcategory_dict[subcategory_name] = subcategory
                    else:
                        subcategory = subcategory_dict[subcategory_name]

                    # Cache Food object
                    if food_name not in food_dict:
                        food, created = Food.objects.get_or_create(
                            name=food_name,
                            subcategory=subcategory,
                            nutriscore=row['nutriscore']
                        )
                        food_dict[food_name] = food  # Cache the food object
                    else:
                        food = food_dict[food_name]

                    # Prepare the FoodNutrient objects for bulk creation
                    for nutrient_name in food_nutrients.columns[3:-1]:  # Skip first 3 columns (name, category, sub_category)
                        nutrient_value = row[nutrient_name]
                        if pd.notnull(nutrient_value):
                            nutrient = nutrient_dict.get(nutrient_name)

                            # Only add to the bulk list if the nutrient is found in the cache
                            if nutrient:
                                food_nutrients_to_create.append(
                                    FoodNutrient(
                                        food=food,
                                        nutrient=nutrient,
                                        value=nutrient_value
                                    )
                                )
                            else:
                                self.stderr.write(self.style.ERROR(f"{error}: Nutrient '{nutrient_name}' not found in the database."))
                                sys.exit(1)

                # Bulk insert FoodNutrient objects
                if food_nutrients_to_create:
                    FoodNutrient.objects.bulk_create(food_nutrients_to_create)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: {e}"))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS("Food nutrients data imported successfully."))
