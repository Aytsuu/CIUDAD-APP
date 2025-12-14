#!/usr/bin/env python
"""
Export sanitized data from production database.
Run on production or with access to production DB:
python export_sanitized_data.py
"""
import os
import json
import sys
import shutil
from datetime import datetime
from faker import Faker

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
        'limit': 20,  # Only export 50 users
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

def sanitize_data(model_name, data):
    """Sanitize sensitive data"""
    config = EXPORT_CONFIG.get(model_name, {})
    sanitize_rules = config.get('sanitize', {})
    
    for obj in data:
        for field_name, sanitizer in sanitize_rules.items():
            if hasattr(obj, field_name):
                setattr(obj, field_name, sanitizer())
    
    return data

def export_model(model_name):
    """Export a single model with sanitization"""
    try:
        app_label, model_class = model_name.split('.')
        Model = apps.get_model(app_label, model_class)
    except (ValueError, LookupError):
        print(f"⚠️  Could not find model: {model_name}")
        return None
    
    config = EXPORT_CONFIG.get(model_name, {})
    limit = config.get('limit')
    
    # Query data
    queryset = Model.objects.all()
    if limit:
        queryset = queryset[:limit]
    
    data = list(queryset)
    count = len(data)
    
    if count == 0:
        print(f"ℹ️  {model_name}: No data to export")
        return None
    
    # Sanitize
    data = sanitize_data(model_name, data)
    
    # Serialize to JSON
    json_data = serializers.serialize('json', data, indent=2)
    
    print(f"✅ {model_name}: Exported {count} records")
    return json_data

def main():
    print("="*70)
    print("Exporting Sanitized Data from Production")
    print("="*70)
    print()
    
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
            
            with open(filepath, 'w') as f:
                f.write(json_data)
            
            all_data[model_name] = json_data
    
    # Create combined file
    combined_file = os.path.join(output_dir, 'all_data.json')
    with open(combined_file, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print()
    print("="*70)
    print(f"✅ Data exported to {output_dir}/")
    print("="*70)
    print()
    print("Next steps:")
    print("1. Review the exported files to ensure data is properly sanitized")
    print("2. Commit to repository: git add seed_data/")
    print("3. The data will be automatically loaded in preview branches")

if __name__ == '__main__':
    # Check for Faker
    try:
        from faker import Faker
    except ImportError:
        print("❌ Faker not installed. Install with: pip install faker")
        sys.exit(1)
    
    main()