from django.core.management.base import BaseCommand
from adminpanel.models import Food, Biochemical, FoodWeight
from django.db import transaction

import pandas as pd
import os

class Command(BaseCommand):
    help = 'Create Food Weights from CSV data'

    def handle(self, *args, **kwargs):
        bias_csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/biochemical_foods_bias_df.csv')
        weight_csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/biochemical_foods_weights.csv')

        try:
            bias_data = pd.read_csv(bias_csv_path)
            weight_data = pd.read_csv(weight_csv_path)
            self.stdout.write(self.style.SUCCESS(f"Bias CSV shape: {bias_data.shape}, Weight CSV shape: {weight_data.shape}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV files: {e}"))
            return

        if bias_data.shape[0] != weight_data.shape[0]:
            self.stderr.write(self.style.ERROR("The number of rows in the bias and weight CSV files do not match."))
            return

        with transaction.atomic():
            for index, row in bias_data.iterrows():
                biochemical_name = row['name']

                try:
                    biochemical, _ = Biochemical.objects.get_or_create(name=biochemical_name)

                    for food_name in bias_data.columns[1:]:  # Skipping the 'name' column
                        bias_value = row.get(food_name, None)
                        weight_value = weight_data.iloc[index].get(food_name, None)

                        if pd.notnull(bias_value) and pd.notnull(weight_value):  # Ensure values are not NaN
                            try:
                                food, _ = Food.objects.get_or_create(name=food_name)

                                FoodWeight.objects.update_or_create(
                                    biochemical=biochemical,
                                    food=food,
                                    defaults={
                                        'bias': bias_value,
                                        'weight': weight_value
                                    }
                                )
                            except Exception as e:
                                self.stderr.write(self.style.ERROR(f"Error creating/updating FoodWeight for food '{food_name}': {e}"))

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing biochemical row {index}: {e}"))
                    raise  

        self.stdout.write(self.style.SUCCESS("Food biases and weights import completed successfully."))
