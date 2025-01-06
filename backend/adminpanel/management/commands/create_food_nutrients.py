from django.core.management.base import BaseCommand
from django.db import transaction
from adminpanel.models import Food, Category, SubCategory, Nutrient, FoodNutrient

import os
import pandas as pd


class Command(BaseCommand):
    help = 'Import foods and their nutrient values from CSV file'

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/food_nutrients.csv')

        
        try:
            data = pd.read_csv(csv_path)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV file: {e}"))
            return

        with transaction.atomic():
            for index, row in data.iterrows():
                food_name = row['name']
                category_name = row['category']
                subcategory_name = row['sub_category']

                try:
                    # Get or create the Category and SubCategory
                    category, _ = Category.objects.get_or_create(name=category_name)
                    subcategory, _ = SubCategory.objects.get_or_create(name=subcategory_name, category=category)

                    # Create the Food object
                    food, created = Food.objects.get_or_create(
                        name=food_name,
                        subcategory=subcategory,
                        nutriscore=row['nutriscore'] 
                    )

                    # Iterate over the nutrients and create FoodNutrient relationships
                    for nutrient_name in data.columns[3:-1]:  # Skipping the first three columns and the last column (nutriscore)
                        nutrient_value = row[nutrient_name]
                        
                        if pd.notnull(nutrient_value):  # Check if the value is not NaN
                            try:
                                nutrient, _ = Nutrient.objects.get_or_create(name=nutrient_name)
                                FoodNutrient.objects.create(
                                    food=food,
                                    nutrient=nutrient,
                                    value=nutrient_value
                                )
                            except Nutrient.DoesNotExist:
                                self.stderr.write(self.style.ERROR(f"Nutrient '{nutrient_name}' not found in the database."))
                                continue
                        
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing row {index}: {e}"))
                    raise  # Raise to ensure rollback

        self.stdout.write(self.style.SUCCESS("Food and nutrient data import completed successfully."))
