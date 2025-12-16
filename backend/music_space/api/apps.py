"""apps.py"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """Configuration for the API app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'music_space.api'

    def ready(self) -> None:  # noqa: PLR6301
        """Import signals when the app is ready."""
        import music_space.api.signals  # noqa: F401, PLC0415
