from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Min, Max
from adminpanel.models import Food, FoodNutrient

class Command(BaseCommand):
    help = 'Normalize the nutriscore in the Food table and the nutrient values in the FoodNutrient table.'

    def handle(self, *args, **options):
        try:
            self.normalize_food_nutriscores()
            self.normalize_food_nutrient_values()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Normalization failed: {e}'))
            raise

    def normalize_food_nutriscores(self):
        self.stdout.write(self.style.SUCCESS('Normalizing Food nutriscores...'))
        try:
            with transaction.atomic():
                # Get all non-null nutriscore values
                nutriscore_values = Food.objects.exclude(nutriscore__isnull=True).values_list('nutriscore', flat=True)

                if nutriscore_values:
                    min_value = min(nutriscore_values)
                    max_value = max(nutriscore_values)

                    # Normalize all Food instances
                    foods = Food.objects.all()
                    for food in foods:
                        if food.nutriscore is None:
                            self.stdout.write(self.style.WARNING(f'Warning: Food {food.name} is missing a nutriscore.'))
                            continue

                        if max_value != min_value:
                            food.normalized_nutriscore = (food.nutriscore - min_value) / (max_value - min_value)
                        else:
                            food.normalized_nutriscore = 0
                        food.save(update_fields=['normalized_nutriscore'])
                else:
                    self.stdout.write(self.style.WARNING('No valid nutriscore values found.'))
                    Food.objects.update(normalized_nutriscore=0)

            self.stdout.write(self.style.SUCCESS('Food nutriscores normalized successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during Food nutriscore normalization: {e}'))
            raise  # Re-raise the exception to trigger a rollback

    def normalize_food_nutrient_values(self):
        self.stdout.write(self.style.SUCCESS('Normalizing FoodNutrient values...'))
        try:
            with transaction.atomic():
                nutrients = FoodNutrient.objects.values_list('nutrient', flat=True).distinct()

                for nutrient in nutrients:
                    # Fetch all FoodNutrient instances related to the nutrient
                    food_nutrients = FoodNutrient.objects.filter(nutrient=nutrient)

                    if not food_nutrients.exists():
                        self.stdout.write(self.style.WARNING(f'Warning: No FoodNutrient records found for nutrient ID {nutrient}.'))
                        continue  # No food nutrients to process

                    # Calculate minimum and maximum values
                    min_value = food_nutrients.aggregate(Min('value'))['value__min']
                    max_value = food_nutrients.aggregate(Max('value'))['value__max']

                    if min_value is None or max_value is None:
                        self.stdout.write(self.style.WARNING(f'Warning: No valid values found for nutrient ID {nutrient}.'))
                        continue  # No valid values to normalize

                    if min_value == max_value:
                        # If all values are the same, set all normalized values to 0
                        normalized_value = 0
                        food_nutrients.update(normalized_value=normalized_value)
                    else:
                        # Normalize values
                        for food_nutrient in food_nutrients:
                            if food_nutrient.value is None:
                                self.stdout.write(self.style.WARNING(f'Warning: FoodNutrient record {food_nutrient.id} for food {food_nutrient.food.name} '
                                                                      f'and nutrient {food_nutrient.nutrient.name} is missing a value.'))
                                continue

                            normalized_value = (food_nutrient.value - min_value) / (max_value - min_value)
                            food_nutrient.normalized_value = normalized_value
                            food_nutrient.save()

            self.stdout.write(self.style.SUCCESS('FoodNutrient values normalized successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during FoodNutrient normalization: {e}'))
            raise  # Re-raise the exception to trigger a rollback
