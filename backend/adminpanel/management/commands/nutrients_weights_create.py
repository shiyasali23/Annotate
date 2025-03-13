from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from adminpanel.models import  Nutrient, Biochemical, NutrientWeight


import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create Nutrient Weights from CSV data'

    def handle(self, *args, **kwargs):
        error = "Error creating nutrients weights/bias"

        try:
            bias_data = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_nutrients_bias.csv"))
            weight_data = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_nutrients_weights.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error} on reading CSV files: {e}"))
            sys.exit(1)

        # Prepare dictionaries for caching existing Nutrient and Biochemical objects
        nutrient_dict = {nutrient.name: nutrient for nutrient in Nutrient.objects.all()}
        biochemical_dict = {biochemical.name: biochemical for biochemical in Biochemical.objects.all()}

        # List for bulk creating NutrientWeight objects
        nutrient_weights_to_create = []

        with transaction.atomic():
            try:
                # Iterate through each biochemical (row) in the CSV
                for index, row in bias_data.iterrows():
                    biochemical_name = row['name']

                    # Get or create the Biochemical object
                    biochemical = biochemical_dict.get(biochemical_name)
                    if not biochemical:
                        biochemical, _ = Biochemical.objects.get_or_create(name=biochemical_name)
                        biochemical_dict[biochemical_name] = biochemical  # Cache the created object

                    # Iterate over the nutrient names (excluding 'name' column)
                    for nutrient_name in bias_data.columns[1:]:  # Skipping the 'name' column
                        bias_value = row.get(nutrient_name)
                        weight_value = weight_data.iloc[index].get(nutrient_name)

                        # Ensure the values are not NaN before proceeding
                        if pd.notnull(bias_value) and pd.notnull(weight_value):
                            # Get or create the nutrient object, caching it if it already exists
                            nutrient = nutrient_dict.get(nutrient_name)
                            if not nutrient:
                                nutrient, _ = nutrient.objects.get_or_create(name=nutrient_name)
                                nutrient_dict[nutrient_name] = nutrient  # Cache the created object
                            # Prepare the data for bulk insert into NutrientWeight
                            nutrient_weights_to_create.append(
                                NutrientWeight(
                                    biochemical=biochemical,
                                    nutrient=nutrient,  # Assuming Nutrient is the same as nutrient here, adjust as needed
                                    bias=bias_value,
                                    weight=weight_value
                                )
                            )

                # Bulk create all NutrientWeight objects at once to minimize database hits
                if nutrient_weights_to_create:
                    NutrientWeight.objects.bulk_create(nutrient_weights_to_create)

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"{error}: {e}"))
                sys.exit(1)

        self.stdout.write(self.style.SUCCESS("Nutrient biases and weights imported successfully."))