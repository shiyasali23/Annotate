from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings

from adminpanel.models import Biochemical, Condition, BiochemicalCondition

import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create biochemicals from CSV file'

    def handle(self, *args, **kwargs):
        error = "Error creating conditions" 

        try:
            biochemical_conditions_df = pd.read_csv(os.path.join(settings.BASE_DIR, "datasets/biochemical_conditions.csv"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: Error reading CSV file: {e}"))
            sys.exit(1)

        biochemical_dict = {biochemical.name: biochemical for biochemical in Biochemical.objects.all()}
        condition_dict = {condition.name: condition for condition in Condition.objects.all()}

        biochemical_conditions_to_create = []

        try:
            with transaction.atomic():
                for index, row in biochemical_conditions_df.iterrows():
                    biochemical_name = row['name']
                    
                    # Get or skip the Biochemical object from the cache
                    biochemical = biochemical_dict.get(biochemical_name)
                    if not biochemical:
                        biochemical, _ = Biochemical.objects.get_or_create(name=biochemical_name)
                        biochemical_dict[biochemical_name] = biochemical

                    # Iterate over the conditions (columns excluding 'name')
                    for condition_name in biochemical_conditions_df.columns[1:]:
                        value = row.get(condition_name)  
                        if value == 0:
                            continue
                        
                        # Get or create Condition object, caching it if created
                        condition = condition_dict.get(condition_name)
                        if not condition:
                            condition, _ = Condition.objects.get_or_create(name=condition_name)
                            condition_dict[condition_name] = condition

                        # Create the BiochemicalCondition object and append to the list for bulk insertion
                        biochemical_conditions_to_create.append(
                            BiochemicalCondition(
                                biochemical=biochemical,
                                condition=condition,
                                is_hyper=True if value == 1 else False if value == -1 else None
                            )
                        )

                # Bulk insert the collected BiochemicalCondition objects
                if biochemical_conditions_to_create:
                    BiochemicalCondition.objects.bulk_create(biochemical_conditions_to_create)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{error}: {e}"))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS("Conditions data imported successfully."))
