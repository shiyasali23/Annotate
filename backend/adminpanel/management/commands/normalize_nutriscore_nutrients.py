import sys
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Min, Max, F, FloatField
from django.db.models.expressions import Case, When, Value
from adminpanel.models import Food, FoodNutrient

class Command(BaseCommand):
    help = 'Normalize the nutriscores in the Food table and the nutrients values in the FoodNutrient table.'
    error = "Error normalizing nutriscores and nutrients"

    def handle(self, *args, **options):
        try:
            self.normalize_food_nutriscores()
            self.normalize_food_nutrient_values()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'{self.error}: {e}'))
            sys.exit(1)  

    def normalize_food_nutriscores(self):
        with transaction.atomic():
            nutriscore_range = Food.objects.aggregate(
                min_value=Min('nutriscore'),
                max_value=Max('nutriscore')
            )
            min_value = nutriscore_range['min_value']
            max_value = nutriscore_range['max_value']

            if min_value is None or max_value is None:
                self.stdout.write(self.style.ERROR(f'{self.error}: No valid nutriscore values found.'))
                sys.exit(1)  

            if min_value != max_value:
                Food.objects.update(
                    normalized_nutriscore=Case(
                        When(nutriscore__isnull=True, then=Value(0)),
                        default=(F('nutriscore') - min_value) / (max_value - min_value),
                        output_field=FloatField()
                    )
                )
            else:
                Food.objects.update(normalized_nutriscore=0)

        self.stdout.write(self.style.SUCCESS('Nutriscores normalized successfully.'))

    def normalize_food_nutrient_values(self):
        with transaction.atomic():
            try:
                for nutrient_id in FoodNutrient.objects.values_list('nutrient', flat=True).distinct():
                    nutrient_range = FoodNutrient.objects.filter(nutrient=nutrient_id).aggregate(
                        min_value=Min('value'),
                        max_value=Max('value')
                    )
                    min_value = nutrient_range['min_value']
                    max_value = nutrient_range['max_value']

                    if min_value is None or max_value is None or min_value == max_value:
                        FoodNutrient.objects.filter(nutrient=nutrient_id).update(normalized_value=0)
                    else:
                        FoodNutrient.objects.filter(nutrient=nutrient_id).update(
                            normalized_value=(F('value') - min_value) / (max_value - min_value)
                        )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'{self.error}: {e}'))
                sys.exit(1)  

        self.stdout.write(self.style.SUCCESS('Nutrients normalized successfully.'))
