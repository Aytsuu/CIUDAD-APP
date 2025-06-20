# authentication/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.db.models import Q
import logging
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
            rp_id = request.data.get('rp')

            with transaction.atomic():
                # Check for existing account
                if Account.objects.filter(Q(supabase_id=supabase_id) | Q(email=email)).exists():
                    return Response(
                        {'error': 'Account already exists'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create new account
                account = Account.objects.create(
                    supabase_id=supabase_id,
                    email=email,
                    username=username or email.split('@')[0]
                )
                
                # Handle resident profile association
                if rp_id:
                    try:
                        # Use select_for_update to lock the row during transaction
                        resident = ResidentProfile.objects.select_for_update().get(rp_id=rp_id)
                        resident.account = account
                        resident.save()
                    except ResidentProfile.DoesNotExist:
                        # Create new resident profile if it doesn't exist
                        resident = ResidentProfile.objects.create(
                            rp_id=rp_id,
                            account=account
                        )
                        logger.info(f"Created new resident profile with rp_id: {rp_id}")

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