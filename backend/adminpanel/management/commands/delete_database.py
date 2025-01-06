import os
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

class Command(BaseCommand):
    help = 'Delete all mlmodels tables, sequences, and views in the PostgreSQL database'

    def handle(self, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                # Drop all tables, sequences, and views related to the mlmodels app in the PostgreSQL database
                cursor.execute("""
                -- Drop all tables in the mlmodels schema
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- For each table in the mlmodels schema, drop it
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'mlmodels_%')
                    LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;

                -- Drop all sequences in the mlmodels schema
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- For each sequence in the mlmodels schema, drop it
                    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE 'mlmodels_%')
                    LOOP
                        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
                    END LOOP;
                END $$;

                -- Drop all views in the mlmodels schema
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- For each view in the mlmodels schema, drop it
                    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'mlmodels_%')
                    LOOP
                        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.table_name) || ' CASCADE';
                    END LOOP;
                END $$;
                """)
            
            # Remove all migration files in the 'mlmodels/migrations/' directory that start with '00'
            migrations_dir = 'mlmodels/migrations/'
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file.startswith('00'):
                    os.remove(os.path.join(migrations_dir, file))

            self.stdout.write(self.style.SUCCESS('All mlmodels tables, sequences, views, and migrations deleted successfully.'))

        except Exception as e:
            raise CommandError(f'Error deleting mlmodels data: {str(e)}')
