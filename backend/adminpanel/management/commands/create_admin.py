from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.core.management import call_command

from django.contrib.auth import get_user_model

import os
from pathlib import Path
import sys

class Command(BaseCommand):
    help = "Resets database, runs migrations, and creates a superuser."

    apps = ['webapp', 'adminpanel', 'diagnosis', 'mlmodel']

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Resetting database...'))
        call_command("reset_database")

        self.stdout.write(self.style.NOTICE('Creating new migrations...'))
        call_command("makemigrations")

        self.stdout.write(self.style.NOTICE('Applying migrations...'))
        call_command("migrate")

        self.stdout.write(self.style.NOTICE('Biochemicals data creating...'))
        call_command("biochemicals_units_create")
        
        self.stdout.write(self.style.NOTICE('Conditions data creating...'))
        call_command("conditions_create")
        
        self.stdout.write(self.style.NOTICE('Nutrients categories data creating...'))
        call_command("create_food")
        
        self.stdout.write(self.style.NOTICE('Food weights/bias data creating...'))
        call_command("food_weights_create")
        
        self.stdout.write(self.style.NOTICE('Nutrients weights/bias data creating...'))
        call_command("nutrients_weights_create")
        
        self.stdout.write(self.style.NOTICE('Normalizing nutriscores and nutrients...'))
        call_command("normalize_nutriscore_nutrients")
        
        self.stdout.write(self.style.NOTICE('Validating normalization of nutriscores and nutrients...'))
        call_command("validate_normalization")
       
        self.stdout.write(self.style.NOTICE('Diagnosis weights/bias data creating...'))
        call_command("diagnosis_create")
        
        self.stdout.write(self.style.NOTICE('Demo user creating...'))
        call_command("user_create")
        
        self.stdout.write(self.style.NOTICE('Biometrics creating...'))
        call_command("biometrics_create")

        User = get_user_model()

        try:
            self.stdout.write(self.style.NOTICE('Creating superuser'))
            with transaction.atomic():
                superuser = User.objects.create_superuser(
                    email="s@g.com",
                    password="x",
                )
                superuser.save()
            self.stdout.write(self.style.SUCCESS('Superuser created successfully!'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Failed to create superuser: {str(e)}'))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS('Setup complete. Biolabs is ready!'))
