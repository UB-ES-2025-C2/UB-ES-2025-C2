from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'musicSpace.api'

    def ready(self):
        import musicSpace.api.signals
