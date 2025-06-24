#
#   Supabase Service
#

from utils import supabase_client as supabase
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase Client
# url = supabase.config.