import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
# from apps.account.models import Account
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

class SupabaseAuthBackend(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        try:
            token = auth_header.split(' ')[1]
            decoded = jwt.decode(
                token,
                settings.SUPABASE_CONFIG['JWT_SECRET'],
                algorithms=[settings.SUPABASE_CONFIG['JWT_ALGORITHM']], 
                audience=settings.SUPABASE_CONFIG['JWT_AUDIENCE'], 
                issuer=f'https://{settings.SUPABASE_CONFIG["SUPABASE_PROJECT_ID"]}.supabase.co/auth/v1'
            )
            
            supabase_id = UUID(decoded['sub'])

            # Just get or create the Account - that's it
            # account, created = Account.objects.get_or_create(
            #     supabase_id=supabase_id,
            #     defaults={
            #         'username': decoded.get('user_metadata', {}).get('username') or decoded.get('email', '').split('@')[0],
            #         'email': decoded.get('email', '')
            #     }
            # )
            
            return (None, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            logger.error(f"Auth error: {str(e)}")
            raise AuthenticationFailed('Authentication failed')