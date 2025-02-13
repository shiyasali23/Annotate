from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from adminpanel.models import Biochemical, Category

import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create biochemicals from CSV file'

    def handle(self, *args, **kwargs):
        csv_path = os.path.join(settings.BASE_DIR, "datasets/biochemical_units.csv")

        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f"CSV file not found: {csv_path}"))
            sys.exit(1)  

        try:
            biochemical_units_df = pd.read_csv(csv_path)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV file: {e}"))
            sys.exit(1)  

        try:
            with transaction.atomic():
                for index, row in biochemical_units_df.iterrows():
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
            self.stderr.write(self.style.ERROR(f"Database error: {e}"))
            sys.exit(1)  

        self.stdout.write(self.style.SUCCESS("Biochemicals data import completed successfully."))
        sys.exit(0)  
