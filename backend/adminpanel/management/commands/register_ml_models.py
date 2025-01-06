from django.core.management.base import BaseCommand
from django.test import Client
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Register machine learning models'

    def handle(self, *args, **kwargs):
        client = Client()

        try:
            response = client.post('/api/mlmodels/register_model/')

            if response.status_code in [200, 201]:
                self.stdout.write(self.style.SUCCESS('Models registered successfully.'))
            else:
                self.stdout.write(self.style.ERROR(f'Failed to register models: {response.status_code}, {response.content}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {str(e)}'))
