# from django.utils.deprecation import MiddlewareMixin
# from django.contrib.auth import get_user_model
# import jwt
# from django.conf import settings

# User = get_user_model()

# class SupabaseJWTAuthenticationMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         # Get the JWT token from the Authorization header
#         auth_header = request.headers.get('Authorization')
#         if auth_header and auth_header.startswith('Bearer '):
#             token = auth_header.split(' ')[1]

#             try:
#                 # Decode and verify the JWT
#                 payload = jwt.decode(
#                     token,
#                     settings.SUPABASE_JWT_SECRET,
#                     algorithms=["HS256"],
#                     audience="authenticated",
#                 )
#                 user_id = payload.get("sub")  # Supabase user ID
#                 email = payload.get("email")

#                 # Get or create the user in Django
#                 user, created = User.objects.get_or_create(
#                     username=user_id,
#                     defaults={"email": email, "password": ""},  # Password is not used
#                 )
#                 request.user = user
#             except jwt.ExpiredSignatureError:
#                 pass  # Token is expired
#             except jwt.InvalidTokenError:
#                 pass  # Token is invalid
#         return None