from supabase import create_client, Client
from django.conf import settings
import base64
import logging

logger = logging.getLogger(__name__)

supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_ANON_KEY,
)

def get_realtime_channel():
    return supabase.realtime.channel('notification')

def upload_to_storage(file_data, bucket, folder=None):
    url = None  # Initialize url variable outside try block
    try:
        b64_string = file_data['file']

        # Strip data URL prefix if present
        if b64_string.startswith('data:'):
            b64_string = b64_string.split(',')[1]

        # Add padding if necessary
        missing_padding = len(b64_string) % 4
        if missing_padding:
            b64_string += '=' * (4 - missing_padding)

        file_bytes = base64.b64decode(b64_string)

        upload_path = f"{folder}/{file_data['name']}" if folder else f"{file_data['name']}"
        supabase.storage.from_(bucket).upload(
            upload_path,
            file_bytes,
            {
                'content-type': file_data['type'],
                'cacheControl': '3600',
                'upsert': False,
                'x-client-info': 'react-native-upload'
            }
        )

        url = supabase.storage.from_(bucket).get_public_url(upload_path)

    except Exception as e:
        logger.error(f"Failed to upload file {file_data['name']}: {str(e)}")

    return url


def remove_from_storage(bucket, file_path):
    try:
        supabase.storage.from_(bucket).remove([file_path])
    except Exception as e:
        logger.error(f"Failed to delete file {file_path} from bucket {bucket}: {str(e)}")
    return