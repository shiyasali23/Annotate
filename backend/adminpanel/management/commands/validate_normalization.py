from django.core.management.base import BaseCommand
from collections import defaultdict
from django.db.models import Prefetch
from django.conf import settings

from adminpanel.models import Food, Nutrient, FoodNutrient

import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Check normalized nutrient values from a CSV file against the database.'
    
    error = "Error validating normalization"
    
    # Tolerance level for comparing float values
    tolerance = 0.0001

    # Columns to ignore
    ignore_columns = ['sub_category', 'nutriscore', 'category']

    def handle(self, *args, **options):
        
        try:
            df = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/normalized_nutrients.csv"), index_col=0) 
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{self.error} on reading CSV files: {e}"))
            sys.exit(1)
        
        try:
            df = df.drop(columns=self.ignore_columns, errors='ignore')
            
            food_nutrients = FoodNutrient.objects.select_related('food', 'nutrient').all().values('food__name', 'nutrient__name', 'normalized_value')
            
            db_data = defaultdict(dict)
            
            for fn in food_nutrients:
                db_data[fn['food__name']][fn['nutrient__name']] = fn['normalized_value']
            
            discrepancies = []
            
            for food_name, nutrients in df.iterrows():
                
                if food_name not in db_data:
                    self.stdout.write(self.style.WARNING(f'Food "{food_name}" not found in the database.'))
                    continue

                for nutrient_name, csv_value in nutrients.items():
                    if nutrient_name not in db_data[food_name]:
                        self.stdout.write(self.style.ERROR(f'{selferror} Nutrient: "{nutrient_name}" for food "{food_name}" not found in the database.'))
                        sys.exit(1)

                    db_value = db_data[food_name][nutrient_name]
                    
                    if abs(csv_value - db_value) > self.tolerance:
                        discrepancies.append((food_name, nutrient_name, csv_value, db_value))

            if discrepancies:
                for food_name, nutrient_name, csv_value, db_value in discrepancies:
                    self.stdout.write(self.style.ERROR(f'{self.error} Food "{food_name}", Nutrient "{nutrient_name}": CSV Value = {csv_value}, DB Value = {db_value}'))
                    sys.exit(1)
            else:
                self.stdout.write(self.style.SUCCESS('Normalization validation successful!'))

        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'{self.error} {e}'))
            sys.exit(1)

