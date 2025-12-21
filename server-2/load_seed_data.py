"""
Load sanitized seed data into database.
Run in preview environments after migrations.
"""
import os
import sys
import json
import logging
from pathlib import Path
from django.db import connection
from django.core.management.color import no_style
from django.apps import apps
from utils.supabase_client import supabase

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.core import serializers
from django.db import transaction, connection

TARGET_APPS = [
    'administration',
    'healthProfiling'
]

def get_file_list():
  """ Dynamically generate list of file names. """

  files = []

  for app_label in TARGET_APPS:
    try:
      app_config = apps.get_app_config(app_label)
      # Get all models for this app
      for model in app_config.get_models():
        # Format file name and append to the list
        model_key = f"{app_label.lower()}_{model.__name__.lower()}.json"

        if supabase.storage.from_('seed-artifacts').exists(model_key):
            files.append(model_key)
            
    except LookupError:
      logger.error(f"App with label {app_label} not found.")

  return files

def check_if_seeded():
    """Check if database already has seed data"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM django_migrations 
                WHERE app = '_seed_data_marker'
            )
        """)
        return cursor.fetchone()[0]

def mark_as_seeded():
    """Mark database as seeded to prevent re-seeding"""
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO django_migrations (app, name, applied)
            VALUES ('_seed_data_marker', 'initial_seed', NOW())
            ON CONFLICT DO NOTHING
        """)

def load_json_fixture(filepath):
    """Load a JSON fixture file"""
    if not filepath.exists():
        logger.error(f"⚠️  File not found: {filepath}")
        return 0
    
    with open(filepath, 'r') as f:
        data = f.read()
    
    try:
        objects = serializers.deserialize('json', data)

        count = 0
        batch = []
        Model = None
        BATCH_SIZE = 5000
        
        for obj in objects:
            object_instance = obj.object
            if Model is None:
                Model = type(object_instance)
            
            batch.append(object_instance)
            count += 1

            if len(batch) >= BATCH_SIZE:
                Model.objects.bulk_create(batch, ignore_conflicts=True)
                batch = []
        
        if len(batch) > 0 and Model:
            Model.objects.bulk_create(batch, ignore_conflicts=True)

        return count
    except Exception as e:
        logger.error(f"❌ Error loading {filepath.name}: {e}")
        return 0

def load_seed_data():
    """Load all seed data files"""

    # Check if already seeded
    if check_if_seeded():
        logger.info("ℹ️  Database already seeded (skipping)")
        return
    
    seed_dir = Path(__file__).parent / 'seed_data'
    
    if not seed_dir.exists():
        logger.error(f"⚠️  Seed data directory not found: {seed_dir}")
        logger.error("Run export_sanitized_data.py first to create seed data")
        return
    
    # Load files in dependency order
    load_order = get_file_list()
    
    total_loaded = 0
    
    # Load seed
    with transaction.atomic():
        for filename in load_order:
            filepath = seed_dir / filename
            
            if filepath.exists():
                count = load_json_fixture(filepath)
                total_loaded += count
            else:
                logger.error(f"⚠️  Not found: {filename}")
        
        # Mark as seeded
        mark_as_seeded()

    logger.info(f"✅ Loaded {total_loaded} total records")

def reset_all_sequence():
    """
    Fixes 'duplicate key value' errors by updating the database counters
    to match the highest ID currently in existing tables.
    """

    all_models = []
    filtered_models = []

    # Collect all models from installed apps
    for app_config in apps.get_app_configs():
        # Extract models and insert to all models list
        all_models.extend(app_config.get_models())

    # Filter models with data (exclude empty models)
    for model in all_models:
        if model._meta.app_label in [app.lower() for app in TARGET_APPS]:
            model_key = f"{model._meta.app_label}_{model.__name__.lower()}.json"
            
            if supabase.storage.from_('seed-artifacts').exists(model_key):
                filtered_models.append(model)
    

    # SQL commands to reset sequences for these apps
    sql_commands = connection.ops.sequence_reset_sql(no_style(), filtered_models)

    if sql_commands:
        with connection.cursor() as cursor:
            for sql in sql_commands:
                cursor.execute(sql)
            logger.info("Fixed sequences")
    else:
        logger.info("No sequences needed resetting")

if __name__ == '__main__':
    try:
        load_seed_data()
        reset_all_sequence()
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)