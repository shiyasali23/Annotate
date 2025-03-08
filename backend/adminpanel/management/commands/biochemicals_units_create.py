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
        error = "Error creating biochemicals"  

        try:
            biochemical_units_df = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_units.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: reading CSV file: {e}"))
            sys.exit(1)

        # Cache Category objects to avoid repeated database queries
        category_dict = {category.name: category for category in Category.objects.all()}

        biochemicals_to_create = []

        try:
            with transaction.atomic():
                for index, row in biochemical_units_df.iterrows():
                    # Get or create the Category object, caching it if created
                    category_name = row['category']
                    category = category_dict.get(category_name)

                    if not category:
                        category, _ = Category.objects.get_or_create(name=category_name)
                        category_dict[category_name] = category  # Cache the created category

                    # Prepare the Biochemical data for bulk creation
                    biochemicals_to_create.append(
                        Biochemical(
                            name=row['name'],
                            category=category,
                            validity_days=row.get('validity', 0),
                            female_min=row.get('female_min', 0.0),
                            female_max=row.get('female_max', 0.0),
                            male_min=row.get('male_min', 0.0),
                            male_max=row.get('male_max', 0.0),
                            unit=row.get('unit', 'g/dL')
                        )
                    )

                # Bulk insert the collected Biochemical objects
                if biochemicals_to_create:
                    Biochemical.objects.bulk_create(biochemicals_to_create)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: {e}"))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS("Biochemicals data imported successfully."))
