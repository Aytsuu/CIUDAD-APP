from supabase import create_client
from decouple import config
import os

supabase = create_client(
    config('VITE_SUPABASE_URL'),
    config('VITE_SUPABASE_KEY'),
)

def upload_file(user_id, file):
    file_ext = os.path.splitext(file.name)[1]
    file_path = f"user_{user_id}/{file.name}"
    
    res = supabase.storage.from_(config('USER_IMAGE_BUCKET')).upload(
        path = file_path,
        file=file,
        file_options={"content-type": file.content_type}
    )
    
    if res.status_code == 200:
        return supabase.storage.from_(config('USER_IMAGE_BUCKET')).get_public_url(file_path)
    raise Exception("Upload failed")
    