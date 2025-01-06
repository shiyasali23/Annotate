from django.core.management.base import BaseCommand
from django.db import transaction
from adminpanel.models import Nutrient, Category

import pandas as pd
import os


class Command(BaseCommand):
    help = 'Create nutrient categories from CSV file'

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(os.path.dirname(__file__),'../../../../datasets/csv/nutrients_categories.csv')

        nutrients_categories = pd.read_csv(csv_path) 

        with transaction.atomic():
            for index, row in nutrients_categories.iterrows():
                try: 
                    category, created = Category.objects.get_or_create(name=row['category'])
                    
                    Nutrient.objects.create(
                        name=row['name'],
                        category=category,
                        unit=row.get('unit')
                    )
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing row {index}: {e}"))
                    raise  

        self.stdout.write(self.style.SUCCESS("Nutrient data import completed successfully."))
