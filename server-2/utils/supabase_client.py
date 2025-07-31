from supabase import create_client
from decouple import config

supabase = create_client(
    config('SUPABASE_URL'),
    config('SUPABASE_ANON_KEY'),
)

# supabase = create_client(
#     config('VITE_SUPABASE_URL'),
#     config('VITE_SUPABASE_ANON_KEY'),
# )