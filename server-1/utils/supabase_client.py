from supabase import create_client, Client
from django.conf import settings

supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_ANON_KEY,
)

def get_realtime_channel():
    return supabase.realtime.channel('notification')