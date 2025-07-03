# from django.apps import AppConfig
# from django.db.models.signals import post_migrate

# def create_initial_categories(sender, **kwargs):
#     from .models import VaccineCategory  # Import inside function to avoid circular import
#     VaccineCategory.objects.get_or_create(
#         vaccat_id=1, defaults={'vaccat_type': 'Vaccine'}
#     )
#     VaccineCategory.objects.get_or_create(
#         vaccat_id=2, defaults={'vaccat_type': 'Immunization Supplies'}
#     )

# class InventoryConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'apps.inventory'
    
#     def ready(self):
#         post_migrate.connect(create_initial_categories, sender=self)
