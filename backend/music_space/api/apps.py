from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'music_space.api'

    def ready(self):
        import music_space.api.signals
