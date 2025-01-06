from django.core.management.base import BaseCommand
from django.db import transaction
from adminpanel.models import Biochemical, Category

import pandas as pd
import os

class Command(BaseCommand):
    help = 'Create biochemicals from CSV file'

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/biochemical_units.csv')
        biochemical_units_df = pd.read_csv(csv_path) 

        with transaction.atomic():
            for index, row in biochemical_units_df.iterrows():
                try: 
                    category, created = Category.objects.get_or_create(name=row['category'])
                    
                    Biochemical.objects.create(
                        name=row['name'],
                        category=category,
                        validity_days=row.get('validity', 0),
                        female_min=row.get('female_min', 0.0),
                        female_max=row.get('female_max', 0.0),
                        male_min=row.get('male_min', 0.0),
                        male_max=row.get('male_max', 0.0),
                        unit=row.get('unit', 'g/dL')
                    )
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Error processing row {index}: {e}"))
                    raise  

        self.stdout.write(self.style.SUCCESS("Biochemical data import completed successfully."))
