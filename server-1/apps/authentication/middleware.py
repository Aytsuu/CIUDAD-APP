# from django.utils.deprecation import MiddlewareMixin

# class AccountMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         if hasattr(request, 'user'):
#             request.account = request.user

from django.http import JsonResponse
from utils.supabase_client import supabase
import logging

logger = logging.getLogger(__name__)

class AuthCheckingMiddleware:
    """ Protects API routes """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        """ List of protected API paths """
        protected_paths = [
            '/authentication/user/',
            '/authentication/refresh/',
            # Add other protected paths here
        ]
        
        # Skip authentication for non-protected paths
        if not any(request.path.startswith(path) for path in protected_paths):
            return self.get_response(request)
        
        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning(f"Missing or invalid auth header for {request.path}")
            return JsonResponse({
                'error': 'Authorization token required',
                'details': 'Please provide a valid Bearer token'
            }, status=401)
        
        access_token = auth_header.split(' ')[1]
        
        try:
            # Verify token with Supabase
            user_response = supabase.auth.get_user(access_token)
            supabase_user = user_response.user
            
            if not supabase_user:
                logger.warning(f"Invalid token for {request.path}")
                return JsonResponse({
                    'error': 'Invalid or expired token',
                    'details': 'Token validation failed'
                }, status=401)
            
            logger.info(f"Authenticated user: {supabase_user.email} for {request.path}")
            
            # Attach Supabase user to request for later use
            request.supabase_user = supabase_user
            
        except Exception as e:
            logger.error(f"Token validation failed for {request.path}: {str(e)}")
            return JsonResponse({
                'error': 'Token validation failed',
                'details': 'Unable to verify authentication token'
            }, status=401)
        
        return self.get_response(request)