import os
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from django.db import connection, OperationalError
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates the initial admin data and superuser'

    apps = ['webapp', 'adminpanel', 'mlmodels', 'diagnosis']

    def migrate_apps(self):
        call_command("makemigrations")
        call_command("migrate")

    def check_and_create_db(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except OperationalError:
            self.stdout.write(self.style.SUCCESS('Database does not exist. Creating database and migrations.'))
            try:
                self.migrate_apps()
            except CommandError:
                self.stdout.write(self.style.ERROR('Migration failed, stopping further execution.'))
                raise CommandError('Migration failed, stopping further execution.')

    def drop_all_tables(self):
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
            
            self.stdout.write(self.style.SUCCESS('Database reseting successfull.'))
    
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Error while dropping tables/sequences/views: {str(e)}"))
            raise CommandError(f"Error while dropping tables/sequences/views: {str(e)}")

    def remove_migrations(self):
        for app in self.apps:
            migrations_dir = os.path.join(app, 'migrations')
            if os.path.exists(migrations_dir): 
                for file in os.listdir(migrations_dir):
                    if file.endswith('.py') and file.startswith('00'):
                        try:
                            os.remove(os.path.join(migrations_dir, file))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"Failed to remove migration file {file}: {str(e)}"))
                            raise CommandError(f"Failed to remove migration file {file}: {str(e)}")

    def run_commands(self):
        try:
            call_command('create_biochemical_units')
            call_command('create_nutrient_categories')
            call_command('create_biochemical_conditions')
            call_command('create_food_nutrients')
            call_command('create_food_bias_weights')
            call_command('create_nutrients_bias_weights')
            call_command('normalize_nutriscore_nutreint')
            call_command('check_normalized_nutrients')
            call_command('create_diagnosis')
            call_command('register_ml_models')
            call_command('create_user')
            call_command('create_user_biometrics')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during setup tasks: {str(e)}"))
            raise CommandError(f"Error during setup tasks: {str(e)}")

    def create_superuser(self):
        User = get_user_model()
        if not User.objects.filter(email="s@g.com").exists():
            try:
                User.objects.create_superuser(
                    email="s@g.com",
                    first_name="s",
                    last_name="s",
                    date_of_birth="1111-11-11",
                    gender="male",
                    phone_number=1111111111,
                    height_cm=175.0,
                    weight_kg=68.0,
                    password="x"
                )
                self.stdout.write(self.style.SUCCESS('Superuser creation successfull'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating superuser: {str(e)}"))
                raise CommandError(f"Error during creating superuser: {str(e)}")

    def handle(self, *args, **kwargs):
        try:
            self.check_and_create_db()
            self.drop_all_tables()
            self.remove_migrations()
            self.migrate_apps()
            self.run_commands()
            self.create_superuser()

            self.stdout.write(self.style.SUCCESS('Initial data creation successfull. Biolabs is ready!'))
        except Exception as e:
            raise CommandError(f'Error creating initial data: {str(e)}')
