# import jwt
# from django.contrib.auth import get_user_model
# from django.conf import settings

# User = get_user_model()

# class SupabaseAuthenticationBackend:
#     def authenticate(self, request, token=None):
#         if not token:
#             return None

#         try:
#             # Decode and verify the JWT
#             payload = jwt.decode(
#                 token,
#                 settings.SUPABASE_JWT_SECRET,
#                 algorithms=["HS256"],
#                 audience="authenticated",
#             )
#             user_id = payload.get("sub")  # Supabase user ID
#             email = payload.get("email")

#             # Get or create the user in Django
#             user, created = User.objects.get_or_create(
#                 username=user_id,
#                 defaults={"email": email, "password": ""},  # Password is not used
#             )
#             return user
#         except jwt.ExpiredSignatureError:
#             return None
#         except jwt.InvalidTokenError:
#             return None

#     def get_user(self, user_id):
#         try:
#             return User.objects.get(pk=user_id)
#         except User.DoesNotExist:
#             return None