import pandas as pd
import os

from django.core.management.base import BaseCommand
from adminpanel.models import Nutrient, Biochemical, NutrientWeight
from django.db import transaction

class Command(BaseCommand):
    help = 'Create Nutrient Weights from CSV data'

    def handle(self, *args, **kwargs):        
        bias_csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/biochemical_nutrients_bias.csv')
        weight_csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/biochemical_nutrients_weights.csv')


        try:
            bias_data = pd.read_csv(bias_csv_path)
            weight_data = pd.read_csv(weight_csv_path)
            print(bias_data.shape, weight_data.shape)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV files: {e}"))
            return

        with transaction.atomic():
            # Iterate through each biochemical (row) in the CSV
            for index, row in bias_data.iterrows():
                biochemical_name = row['name']

                try:
                    # Get or create the Biochemical
                    biochemical, _ = Biochemical.objects.get_or_create(name=biochemical_name)

                    # Iterate over the nutrients (columns excluding 'name')
                    for nutrient_name in bias_data.columns[1:]:  # Skipping the 'name' column
                        bias_value = row[nutrient_name]
                        weight_value = weight_data.loc[index, nutrient_name]

                        if pd.notnull(bias_value) and pd.notnull(weight_value):  # Ensure values are not NaN
                            try:
                                # Get or create the Nutrient
                                nutrient, _ = Nutrient.objects.get_or_create(name=nutrient_name)

                                # Create or update NutrientWeight
                                NutrientWeight.objects.update_or_create(
                                    biochemical=biochemical,
                                    nutrient=nutrient,
                                    defaults={
                                        'bias': bias_value,
                                        'weight': weight_value
                                    }
                                )
                            except Nutrient.DoesNotExist:
                                self.stderr.write(self.style.ERROR(f"Nutrient '{nutrient_name}' not found in the database."))
                                continue

                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing row {index}: {e}"))
                    raise  # Raise to ensure rollback

        self.stdout.write(self.style.SUCCESS("Nutrient biases and weights import completed successfully."))
