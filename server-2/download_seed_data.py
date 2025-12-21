import os
import json
import sys
import logging
from datetime import datetime
from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from utils.supabase_client import supabase

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

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
        model_key = f"{app_label.lower()}_{model.__name__.lower()}"
        files.append(model_key)
    except LookupError:
      logger.error(f"App with label {app_label} not found.")

  return files


# Initialize file names
DOWNLOADABLE_FILES = get_file_list()

def main():

  # Create local folder
  output_dir = 'seed_data'
  os.makedirs(output_dir, exist_ok=True)

  # Loop through downloadable files
  for file in DOWNLOADABLE_FILES:
    
    logger.info(f'Downloading {file}...')
    # Download file
    data = supabase.storage.from_('seed-artifacts').download(file)
    decode_json = data.decode(encoding='utf-8')

    # Store to local folder /seed_data
    if data:
      file_path = os.path.join(output_dir, file)
      with open(file_path, 'w', encoding='utf-8') as f:
        f.write(decode_json)


if __name__ == '__main__':
  main()