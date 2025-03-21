import sys
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

class Command(BaseCommand):
    help = "Resets database and migration files."

    apps = ['webapp', 'adminpanel', 'diagnosis', 'mlmodel']

    def handle(self, *args, **kwargs):
        # Reset the database by dropping all tables, sequences, and views
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    DO $$ 
                    DECLARE
                        r RECORD;
                    BEGIN
                        -- Drop all tables in the current schema
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
                            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                        END LOOP;

                        -- Drop all sequences in the current schema
                        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = current_schema()) LOOP
                            EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                        END LOOP;
                        
                        -- Drop all views in the current schema
                        FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = current_schema()) LOOP
                            EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                        END LOOP;
                    END $$;
                """)
            self.stdout.write(self.style.SUCCESS('Database reset successful.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error resetting database: {str(e)}"))
            sys.exit(1)

        # Remove migration files for each specified app
        try:
            for app in self.apps:
                migrations_dir = Path(app) / "migrations"
                if migrations_dir.exists():
                    for file in migrations_dir.glob("00*.py"):
                        file.unlink()
                        self.stdout.write(self.style.SUCCESS(f"Removed: {file}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error deleting migration files: {str(e)}"))
            sys.exit(1)

        self.stdout.write(self.style.SUCCESS('Setup complete. Biolabs is ready!'))
