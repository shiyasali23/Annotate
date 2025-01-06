from django.apps import AppConfig

class AdminpanelConfig(AppConfig):
    default_auto_field = 'django.db.models.AutoField'
    name = 'adminpanel'

    def ready(self):
        import adminpanel.signals
