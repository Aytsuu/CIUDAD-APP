from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class ChildhealthservicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.childhealthservices'
    
    def ready(self):
        # Import signals to register them
        try:
            from . import signals
            logger.info("✅ ChildHealthServices signals registered")
        except Exception as e:
            logger.exception(f"❌ Failed to import signals: {e}")
    
   