from django.core.management.base import BaseCommand
from adminpanel.models import Food, Nutrient, FoodNutrient

import pandas as pd
import os

class Command(BaseCommand):
    help = 'Check normalized nutrient values from a CSV file against the database.'

    # Hardcoded CSV path
    csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/normalized_nutrients.csv')


    # Tolerance level for comparing float values
    tolerance = 0.0001

    # Columns to ignore
    ignore_columns = ['sub_category', 'nutriscore','category']

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Reading CSV file...'))
        
        try:
            # Read the CSV file into a pandas DataFrame
            df = pd.read_csv(self.csv_path, index_col=0)  # Assuming the first column contains food names

            # Filter out the columns to ignore
            df = df.drop(columns=self.ignore_columns, errors='ignore')

            # Fetch the normalized values from the database
            food_nutrients = FoodNutrient.objects.select_related('food', 'nutrient').all()

            # Create a dictionary to hold database values
            db_data = {}
            for fn in food_nutrients:
                food_name = fn.food.name
                nutrient_name = fn.nutrient.name
                if food_name not in db_data:
                    db_data[food_name] = {}
                db_data[food_name][nutrient_name] = fn.normalized_value

            # Compare the CSV data with the database data
            discrepancies = []
            for food_name, nutrients in df.iterrows():
                if food_name not in db_data:
                    self.stdout.write(self.style.WARNING(f'Food "{food_name}" not found in the database.'))
                    continue
                
                for nutrient_name, csv_value in nutrients.items():
                    if nutrient_name not in db_data[food_name]:
                        self.stdout.write(self.style.WARNING(f'Nutrient "{nutrient_name}" for food "{food_name}" not found in the database.'))
                        continue
                    
                    db_value = db_data[food_name][nutrient_name]
                    
                    # Compare values with tolerance
                    if abs(csv_value - db_value) > self.tolerance:
                        discrepancies.append((food_name, nutrient_name, csv_value, db_value))
            
            if discrepancies:
                self.stdout.write(self.style.ERROR('Discrepancies found:'))
                for food_name, nutrient_name, csv_value, db_value in discrepancies:
                    self.stdout.write(self.style.ERROR(f'Food "{food_name}", Nutrient "{nutrient_name}": CSV Value = {csv_value}, DB Value = {db_value}'))
            else:
                self.stdout.write(self.style.SUCCESS('No discrepancies found.'))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {self.csv_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error occurred: {e}'))
