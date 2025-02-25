from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from webapp.models import User

import pandas as pd
import os
import sys

class Command(BaseCommand):
    help = 'Create User'

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                # Use create_user on the model's manager
                user = User.objects.create_user(
                    first_name="John",
                    last_name="Doe",
                    password="securepassword123",
                    date_of_birth="1990-01-01",
                    height_cm=175,
                    weight_kg=70,
                    gender="male",
                    email="jhnoe@example.com"
                )
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Database error: {e}"))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS("User created successfully."))
