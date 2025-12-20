import os
import json
import sys
import logging
from datetime import datetime
from django.core.serializers.json import DjangoJSONEncoder
from utils.supabase_client import supabase

logger = logging.getLogger(__name__)

# Initialize file names
DOWNLOADABLE_FILES = [
  'administration_staff.json',
  'administration_assignment.json',
  'administration_feature.json',
  'administration_position.json',
  'healthprofiling_residentprofile.json',
  'healthprofiling_personal.json',
  'healthprofiling_personaladdress.json',
  'healthprofiling_address.json',
  'healthprofiling_sitio.json',
]

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