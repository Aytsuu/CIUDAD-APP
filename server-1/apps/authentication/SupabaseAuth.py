from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from utils.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)

class SupabaseUser:
    def __init__(self, supabase_user):
        self.id = supabase_user.id
        self.email = supabase_user.email
        self.is_authenticated = True

    def __str__(self):
        return self.email

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        access_token = auth_header.split(' ')[1]

        try:
            user_response = supabase.auth.get_user(access_token)
            supabase_user = user_response.user

            if not supabase_user:
                logger.warning(f"Invalid/expired token for {request.path}")
                raise AuthenticationFailed('Invalid or expired session')

            logger.info(f"Authenticated Supabase user: {supabase_user.email}")

            user = SupabaseUser(supabase_user)
            return (user, access_token)

        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}", exc_info=True)
            raise AuthenticationFailed('Session validation failed')
