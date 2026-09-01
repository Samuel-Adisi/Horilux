from django.apps import AppConfig


class OperationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'operations'

    def ready(self):
        from operations.signals import connect_gfk_cleanup_signals
        connect_gfk_cleanup_signals()
