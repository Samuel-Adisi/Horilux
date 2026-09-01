from django.apps import AppConfig


class ViewingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'viewings'

    def ready(self):
        import viewings.signals  # noqa: F401
