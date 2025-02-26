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
        csv_path = os.path.join(settings.BASE_DIR, "datasets/biochemical_conditions.csv")

        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f"CSV file not found: {csv_path}"))
            sys.exit(1)  

        try:
            biochemical_conditions_df = pd.read_csv(csv_path)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading CSV file: {e}"))
            sys.exit(1)  

        try:
            with transaction.atomic():
                for index, row in biochemical_conditions_df.iterrows():
                    biochemical_name = row['name']
                    
                    biochemical = Biochemical.objects.get(name=biochemical_name)
                    
                    for condition_name in biochemical_conditions_df.columns[1:]:
                        value = row[condition_name]  
                        if value == 0:
                            continue
                        
                        condition, _ = Condition.objects.get_or_create(name=condition_name)
                        
                        BiochemicalCondition.objects.create(
                            biochemical=biochemical,
                            condition=condition,
                            is_hyper = True if value == 1 else False if value == -1 else None

                        )

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error creating conditions: {e}"))
            sys.exit(1)  

        self.stdout.write(self.style.SUCCESS("Conditions data import completed successfully."))
