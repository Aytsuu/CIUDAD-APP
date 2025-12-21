"""
Export sanitized data from production database.
Run on production or with access to production DB:
python export_sanitized_data.py
"""
import os
import json
import sys
import logging
from faker import Faker
from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from utils.supabase_client import supabase

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

fake = Faker()

# List of App Labels to include in the export
TARGET_APPS = [
    'account',
    'administration',
    'profiling',
    'report',
    'landing',
]

# Only define models that need SPECIFIC sanitization or limits here
# Everything else will default to limit=None, sanitize={}
SANITIZATION_OVERRIDES = {
    'account.Account': {
        'sanitize': {
            'email': lambda: fake.email(),
            'phone': lambda: fake.numerify('09#########'),
        }
    },
}

def get_export_config():
    """
    Dynamically builds the EXPORT_CONFIG dictionary.
    Merges default settings with specific overrides.
    """
    config = {}

    for app_label in TARGET_APPS:
        try:
            app_config = apps.get_app_config(app_label)
            # Get all models for this app
            for model in app_config.get_models():
                # specific format: 'app_label.ModelName'
                model_key = f"{app_label}.{model.__name__}"
                
                # Default Config
                model_config = {
                    'limit': None,
                    'sanitize': {}
                }

                # Apply Overrides if they exist
                if model_key in SANITIZATION_OVERRIDES:
                    # Update (merge) the dictionary so we don't lose defaults
                    override = SANITIZATION_OVERRIDES[model_key]
                    model_config.update(override)

                config[model_key] = model_config

        except LookupError:
            logger.warning(f"⚠️ App '{app_label}' not found. Skipping.")
    
    return config

# Generate the config once
EXPORT_CONFIG = get_export_config()

def export_model(model_name):
    """
    Fast export using .values() (Low Memory)
    No complex cascading logic.
    """

    try:
        app_label, model_class = model_name.split('.')
        Model = apps.get_model(app_label, model_class)
    except LookupError:
        logger.error(f"⚠️  Could not find model: {model_name}")
        return None


    queryset = Model.objects.all().order_by('pk')
    config = EXPORT_CONFIG.get(model_name, {})

    limit = config.get('limit')
    if limit:
        queryset = queryset[:limit]

    # Streams raw dictionaries instead of creating heavy Django Objects
    data_iterator = queryset.values().iterator(chunk_size=2000)

    formatted_data = []
    sanitize_rules = config.get('sanitize', {})
    
    count = 0 

    for row in data_iterator:
        count += 1
        
        # Get Primary Key (Handle 'id' vs custom PK names)
        pk_name = Model._meta.pk.name
        pk = row.get(pk_name)
        
        # Remove PK from fields (it goes in the 'pk' key, not 'fields')
        if pk_name in row:
            del row[pk_name]

        # Sanitize (Direct Dictionary Modification)
        for field, sanitizer in sanitize_rules.items():
            if field in row:
                row[field] = sanitizer()

        # Reconstruct Django Fixture Format manually
        fixture_item = {
            "model": model_name,
            "pk": pk,
            "fields": row
        }
        formatted_data.append(fixture_item)

    logger.info(f'{model_name} retrieved: {queryset.count()}')

    if count == 0:
        return None
    
    return json.dumps(formatted_data, cls=DjangoJSONEncoder, indent=2)

def main():
    """Export Sanitized Data from Production and Store in Supabase Storage"""
    
    for model_name in EXPORT_CONFIG.keys():
        json_data = export_model(model_name)
        if json_data:
            # Save individual file
            filename = model_name.replace('.', '_').lower() + '.json'

            file_bytes = json_data.encode(encoding='utf-8')
            supabase.storage.from_('seed-artifacts').upload(
                path=filename,
                file=file_bytes,
                file_options={
                    'content-type': 'application/json',
                    'cache-control': '3600',
                    'upsert': 'true'
                }
            )

            logger.info(f"✅ Uploaded {filename}")
    
if __name__ == '__main__':
    # Check for Faker
    try:
        from faker import Faker
    except ImportError:
        logger.error("❌ Faker not installed. Install with: pip install faker")
        sys.exit(1)
    
    main()