from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings
import logging
from supabase import create_client
from apps.account.models import Account
from apps.profiling.models import ResidentProfile
from .serializers import UserAccountSerializer

logger = logging.getLogger(__name__)

class AuthBaseView(APIView):
    permission_classes = [AllowAny]
    
    def validate_request_data(self, data):
        supabase_id = data.get('supabase_id')
        email = data.get('email')
        
        if not supabase_id or not email:
            raise ValueError('supabase_id and email are required')
        
        return supabase_id, email

class LoginView(AuthBaseView):
    def post(self, request):
        try:
            supabase_id, email = self.validate_request_data(request.data)
            username = request.data.get('username')
            profile_image = request.data.get('profile_image')

            with transaction.atomic():
                account = Account.objects.filter(
                    Q(supabase_id=supabase_id) | Q(email=email)
                ).first()

                if account:
                    # Update existing account if needed
                    update_fields = []
                    if str(account.supabase_id) != supabase_id:
                        account.supabase_id = supabase_id
                        update_fields.append('supabase_id')
                    if account.email != email:
                        account.email = email
                        update_fields.append('email')
                    if username and not account.username:
                        account.username = username
                        update_fields.append('username')
                    if profile_image and not account.profile_image:
                        account.profile_image = profile_image
                        update_fields.append('profile_image')
                    
                    if update_fields:
                        account.save(update_fields=update_fields)
                else:
                    # Create new account with resident profile
                    account = Account.objects.create(
                        supabase_id=supabase_id,
                        email=email,
                        username=username or email.split('@')[0],
                        profile_image=profile_image or Account._meta.get_field('profile_image').get_default()
                    )
                    ResidentProfile.objects.create(account=account)

                serializer = UserAccountSerializer(account)
                return Response(serializer.data)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class SignUpView(AuthBaseView):
    def post(self, request):
        try:
            supabase_id, email = self.validate_request_data(request.data)
            username = request.data.get('username')
            rp_id = request.data.get('rp')  # This should be the ResidentProfile ID

            with transaction.atomic():
                # Check for existing account
                if Account.objects.filter(Q(supabase_id=supabase_id) | Q(email=email)).exists():
                    return Response(
                        {'error': 'Account already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Handle resident profile association FIRST
                resident = None
                if rp_id:
                    try:
                        resident = ResidentProfile.objects.select_for_update().get(pk=rp_id)
                        
                        # Check if resident already has an account
                        if hasattr(resident, 'account'):
                            return Response(
                                {'error': 'Resident profile already linked to another account'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except ResidentProfile.DoesNotExist:
                        return Response(
                            {'error': 'Specified resident profile does not exist'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Create new account
                account_data = {
                    'supabase_id': supabase_id,
                    'email': email,
                    'username': username or email.split('@')[0]
                }
                
                # Only include rp if resident exists
                if resident:
                    account_data['rp'] = resident
                
                account = Account.objects.create(**account_data)

                serializer = UserAccountSerializer(account)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Registration failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Fixed Mobile Sync View - Using Function-Based View with proper decorators
@api_view(['POST'])
@permission_classes([AllowAny])
def sync_supabase_session(request):
    """
    Sync Supabase session with Django backend for mobile clients
    """
    try:
        # Get Supabase credentials from settings
        supabase_url = getattr(settings, 'SUPABASE_URL', None)
        supabase_key = getattr(settings, 'SUPABASE_ANON_KEY', None)
        
        if not supabase_url or not supabase_key:
            logger.error("Supabase credentials not configured in settings")
            return Response(
                {'error': 'Supabase credentials not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Extract and validate Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response(
                {'error': 'Authorization header missing or invalid'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Extract token from header
        token = auth_header.split(' ')[1]
        
        # Verify token with Supabase
        try:
            user_response = supabase.auth.get_user(token)
            
            if not user_response or not user_response.user:
                return Response(
                    {'error': 'Invalid Supabase token'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            supabase_user = user_response.user
            user_email = supabase_user.email
            supabase_id = supabase_user.id
            
            if not user_email:
                return Response(
                    {'error': 'User email not found in Supabase token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            logger.error(f"Supabase token validation error: {str(e)}")
            return Response(
                {'error': 'Failed to validate Supabase token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Handle Django user and account creation/update
        with transaction.atomic():
            # Get or create Django User (if you're using Django's built-in User model)
            django_user, user_created = User.objects.get_or_create(
                email=user_email,
                defaults={
                    'username': user_email.split('@')[0],
                    'is_active': True
                }
            )
            
            # Get or create Account
            account, account_created = Account.objects.get_or_create(
                supabase_id=supabase_id,
                defaults={
                    'email': user_email,
                    'username': user_email.split('@')[0],
                }
            )
            
            # Update account if it exists but email changed
            if not account_created and account.email != user_email:
                account.email = user_email
                account.save(update_fields=['email'])
            
            # Create ResidentProfile if account was just created and doesn't have one
            if account_created and not hasattr(account, 'residentprofile'):
                ResidentProfile.objects.create(account=account)
            
            # Create or get Django REST Framework auth token
            from rest_framework.authtoken.models import Token
            django_token, token_created = Token.objects.get_or_create(user=django_user)
            
            # Prepare response data
            response_data = {
                'status': 'success',
                'django_token': django_token.key,
                'user_id': django_user.id,
                'account_id': account.id,
                'email': user_email,
                'supabase_id': supabase_id,
                'is_new_user': user_created,
                'is_new_account': account_created,
                'message': 'Successfully synced with Django backend'
            }
            
            logger.info(f"Mobile sync successful for user: {user_email}")
            return Response(response_data, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Mobile session sync error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Internal server error during sync', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Alternative Class-Based View version (if you prefer)
class MobileSyncView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        return sync_supabase_session(request)