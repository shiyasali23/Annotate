import os
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.core.management import call_command

from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Resets database, runs migrations, and creates a superuser."

    apps = ['webapp', 'adminpanel']

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Creating admin data'))

        # Deleting SQLite database if exists
        db_path = Path(settings.BASE_DIR) / "db.sqlite3"
        if db_path.exists():
            os.remove(db_path)
            self.stdout.write(self.style.SUCCESS("Database deleted successfully."))
        else:
            self.stdout.write(self.style.NOTICE('Database does not exist. Skipping'))

        # Removing migration files
        for app in self.apps:
            migrations_dir = Path(app) / "migrations"
            if migrations_dir.exists():
                for file in migrations_dir.glob("00*.py"):
                    file.unlink()
                    self.stdout.write(self.style.SUCCESS(f"Removed: {file}"))

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
            raise

        self.stdout.write(self.style.SUCCESS('Setup complete. Biolabs is ready!'))
