import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection, transaction
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Resets database, runs migrations, and creates a superuser."

    apps = ['webapp', 'adminpanel']

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting setup...'))

        # Delete SQLite database if exists
        db_path = connection.settings_dict['NAME']
        if isinstance(db_path, Path):
            db_path = str(db_path)
        if db_path.endswith('.sqlite3') and os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write(self.style.SUCCESS(f"Deleted database: {db_path}"))

        # Remove old migrations
        for app in self.apps:
            migrations_dir = Path(app) / "migrations"
            if migrations_dir.exists():
                for file in migrations_dir.glob("00*.py"):
                    file.unlink()
                    self.stdout.write(self.style.SUCCESS(f"Removed: {file}"))

        # Run migrations and setup commands
        self.stdout.write(self.style.NOTICE('Creating new migrations...'))
        call_command("makemigrations")
        
        self.stdout.write(self.style.NOTICE('Applying migrations...'))
        call_command("migrate")
        
        self.stdout.write(self.style.NOTICE('Creating biochemicals...'))
        call_command("biochemichals_units_create")

        # Create superuser if not exists
        User = get_user_model()
        self.stdout.write(self.style.NOTICE('Checking for existing superuser...'))
        if not User.objects.filter(email="s@g.com").exists():
            try:
                self.stdout.write(self.style.NOTICE('Creating superuser...'))
                with transaction.atomic():
                    superuser = User.objects.create_superuser(
                        email="s@g.com",
                        password="x",
                        username="admin"
                    )
                    # Force a save to ensure the user is written to the database
                    superuser.save(force_insert=True)
                self.stdout.write(self.style.SUCCESS('Superuser created successfully!'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Failed to create superuser: {str(e)}'))
                # Re-raise the exception to see the full traceback
                raise
        else:
            self.stdout.write(self.style.SUCCESS('Superuser already exists.'))

        self.stdout.write(self.style.SUCCESS('\nSetup complete. Biolabs is ready! 🚀'))