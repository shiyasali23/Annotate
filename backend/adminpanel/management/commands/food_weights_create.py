from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from adminpanel.models import Food, Biochemical, FoodWeight, Nutrient, NutrientWeight


import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create Food Weights from CSV data'

    def handle(self, *args, **kwargs):
        error = "Error creating food weights/bias"

        try:
            # Read CSV data into DataFrames
            bias_data = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_foods_bias_df.csv"))
            weight_data = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_foods_weights.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error} on reading CSV files: {e}"))
            sys.exit(1)

        # Ensure dataframes have the same number of rows
        if bias_data.shape[0] != weight_data.shape[0]:
            self.stderr.write(self.style.ERROR(f"{error}: mismatched number of rows between bias and weight dataframes"))
            sys.exit(1)

        # Create a list to bulk create or update records
        food_dict = {food.name: food for food in Food.objects.all()}
        biochemical_dict = {biochemical.name: biochemical for biochemical in Biochemical.objects.all()}

        food_weights_to_create = []

        with transaction.atomic():
            try:
                for index, row in bias_data.iterrows():
                    biochemical_name = row['name']
                    biochemical = biochemical_dict.get(biochemical_name)

                    # If the biochemical is not found, create it and cache it
                    if not biochemical:
                        biochemical, _ = Biochemical.objects.get_or_create(name=biochemical_name)
                        biochemical_dict[biochemical_name] = biochemical

                    # Iterate over the food names (excluding 'name' column)
                    for food_name in bias_data.columns[1:]:
                        bias_value = row.get(food_name, None)
                        weight_value = weight_data.iloc[index].get(food_name, None)

                        # Ensure the values are not NaN before proceeding
                        if pd.notnull(bias_value) and pd.notnull(weight_value):
                            food = food_dict.get(food_name)

                            if not food:
                                food, _ = Food.objects.get_or_create(name=food_name)
                                food_dict[food_name] = food  # Cache the created Food object

                            # Prepare the data to bulk create/update FoodWeight
                            food_weights_to_create.append(
                                FoodWeight(
                                    biochemical=biochemical,
                                    food=food,
                                    bias=bias_value,
                                    weight=weight_value
                                )
                            )

                # Bulk create all FoodWeight objects at once to minimize database hits
                if food_weights_to_create:
                    FoodWeight.objects.bulk_create(food_weights_to_create)

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"{error} during processing: {e}"))
                sys.exit(1)

        self.stdout.write(self.style.SUCCESS("Food biases and weights imported successfully."))
