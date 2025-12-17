"""
Export sanitized data from production database.
Run on production or with access to production DB:
python export_sanitized_data.py
"""
import os
import json
import sys
import shutil
import logging
from datetime import datetime
from faker import Faker
from django.core.serializers.json import DjangoJSONEncoder

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.apps import apps
from django.core import serializers
from django.db import connection

fake = Faker()

# Define which models to export and how to sanitize them
EXPORT_CONFIG = {
    # Format: 'app.Model': {config}
    'account.Account': {
        'limit': None,
        'sanitize': {
            'email': lambda: fake.email(),
            'phone': lambda: fake.numerify('09#########'),
        }
    },
    'administration.Staff': {
        'limit': None,
        'sanitize': {}
    },
    'administration.Assignment': {
        'limit': None,
        'sanitize': {}
    },
    'administration.Feature': {
        'limit': None,
        'sanitize': {}
    },
    'administration.Position': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.Voter': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.ResidentProfile': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.Personal': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.PersonalAddress': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.Address': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.Sitio': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.BusinessRespondent': {
        'limit': None,
        'sanitize': {}
    },
    'profiling.Business': {
        'limit': None,
        'sanitize': {}
    },
}

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

    if count == 0:
        return None
    
    logger.info(f'{model_name} retrieved: {queryset.count()}')
    return json.dumps(formatted_data, cls=DjangoJSONEncoder, indent=2)

def main():
    """Exporting Sanitized Data from Production"""
    
    output_dir = 'seed_data'
    
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    os.makedirs(output_dir, exist_ok=True)
    
    all_data = {}
    
    for model_name in EXPORT_CONFIG.keys():
        json_data = export_model(model_name)
        if json_data:
            # Save individual file
            filename = model_name.replace('.', '_').lower() + '.json'
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(json_data)
            
            all_data[model_name] = json_data
    
    # Create combined file
    combined_file = os.path.join(output_dir, 'all_data.json')
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)
    
    logger.info(f"✅ Data exported to {output_dir}/")

if __name__ == '__main__':
    # Check for Faker
    try:
        from faker import Faker
    except ImportError:
        logger.error("❌ Faker not installed. Install with: pip install faker")
        sys.exit(1)
    
    main()