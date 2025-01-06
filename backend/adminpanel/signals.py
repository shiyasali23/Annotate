from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from .models import Food, FoodNutrient
from django.db.models import Min, Max, F, ExpressionWrapper, FloatField

@receiver([post_save, post_delete], sender=Food)
def recalculate_normalized_nutriscores(sender, instance, **kwargs):
    with transaction.atomic():
        # Get min and max nutriscore values in a single query
        nutriscore_stats = Food.objects.aggregate(
            min_score=Min('nutriscore'),
            max_score=Max('nutriscore')
        )
        min_value = nutriscore_stats['min_score']
        max_value = nutriscore_stats['max_score']
        
        if min_value is not None and max_value is not None:
            if max_value != min_value:
                # Use F() expressions for calculation
                Food.objects.filter(nutriscore__isnull=False).update(
                    normalized_nutriscore=ExpressionWrapper(
                        (F('nutriscore') - min_value) / (max_value - min_value),
                        output_field=FloatField()
                    )
                )
            else:
                Food.objects.filter(nutriscore__isnull=False).update(normalized_nutriscore=1)  # or 0, depending on your preference
        else:
            Food.objects.update(normalized_nutriscore=None)

    print(f"Recalculated normalized nutriscores. Min: {min_value}, Max: {max_value}")
    # For debugging: print out some updated values
    for food in Food.objects.filter(nutriscore__isnull=False).order_by('?')[:5]:  # random 5 for example
        print(f"Food: {food.name}, Nutriscore: {food.nutriscore}, Normalized: {food.normalized_nutriscore}")


@receiver([post_save, post_delete], sender=FoodNutrient)
def update_normalized_values(sender, instance, **kwargs):
    with transaction.atomic():
        nutrient = instance.nutrient
        
        # Recalculate min and max values for this nutrient across all foods
        value_stats = FoodNutrient.objects.filter(nutrient=nutrient).aggregate(
            min_value=Min('value'),
            max_value=Max('value')
        )
        min_value = value_stats['min_value']
        max_value = value_stats['max_value']
        
        if min_value is not None and max_value is not None and min_value != max_value:
            # Update normalized values for ALL FoodNutrient instances with this nutrient
            FoodNutrient.objects.filter(nutrient=nutrient).update(
                normalized_value=ExpressionWrapper(
                    (F('value') - min_value) / (max_value - min_value),
                    output_field=FloatField()
                )
            )
        else:
            # If all values are the same or there are no values, set normalized_value to 0
            FoodNutrient.objects.filter(nutrient=nutrient).update(normalized_value=0)

    print(f"Updated normalized values for nutrient: {nutrient.name}")
    # For debugging: print out some updated values
    for fn in FoodNutrient.objects.filter(nutrient=nutrient)[:5]:  # first 5 for example
        print(f"Food: {fn.food.name}, Value: {fn.value}, Normalized: {fn.normalized_value}")