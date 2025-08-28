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
from django.http import JsonResponse
from apps.account.models import Account
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.administration.models import Staff, Assignment
from ..serializers import UserAccountSerializer
from utils.supabase_client import supabase
import random
import requests

logger = logging.getLogger(__name__)

class MobileLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            logger.info("MobileLoginView called")
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return Response(
                    {'error': 'Both email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Authenticate with Supabase
            try:
                supabase_response = supabase.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                supabase_user = supabase_response.user
                logger.info(f"Supabase user: {supabase_user.email if supabase_user else 'None'}")
                if not supabase_user or not supabase_response.session:
                    raise Exception("Authentication failed")
                    
            except Exception as supabase_error:
                logger.error(f"Supabase authentication failed: {str(supabase_error)}")
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Check if account exists in local database
            account = Account.objects.filter(email=supabase_user.email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Serialize user data
            serializer = UserAccountSerializer(account)
            
            return Response({
                'user': serializer.data,
                'access_token': supabase_response.session.access_token,
                'refresh_token': supabase_response.session.refresh_token,
                'expires_at': supabase_response.session.expires_at,
                'message': 'Login successful'
            })

        except Exception as e:
            # logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Authentication failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MobileRefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info("Attempting to refresh token...")
            
            try:
                # Refresh the session with Supabase
                refresh_response = supabase.auth.refresh_session(refresh_token)
                
                if not refresh_response.session or not refresh_response.session.access_token:
                    logger.warning("Invalid refresh token")
                    return Response(
                        {'error': 'Invalid refresh token. Please login again.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                # Get user with new token
                new_access_token = refresh_response.session.access_token
                user_response = supabase.auth.get_user(new_access_token)
                supabase_user = user_response.user
                
                if not supabase_user:
                    raise Exception("Invalid user from refreshed token")
                
                # Get user from database
                account = Account.objects.filter(email=supabase_user.email).first()
                
                if not account:
                    return Response(
                        {'error': 'Account not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Serialize user data
                serializer = UserAccountSerializer(account)
                
                # Return response with new tokens
                return Response({
                    'user': serializer.data,
                    'access_token': new_access_token,
                    'refresh_token': refresh_response.session.refresh_token,
                    'expires_at': refresh_response.session.expires_at,
                    'message': 'Token refreshed successfully'
                }, status=status.HTTP_200_OK)
                    
            except Exception as refresh_error:
                logger.error(f"Token refresh failed: {str(refresh_error)}")
                return Response(
                    {'error': 'Token refresh failed. Please login again.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Token refresh failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MobileUserView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get Authorization header
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response(
                    {'error': 'Authorization header required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            access_token = auth_header.split(' ')[1]
            
            # Validate token with Supabase
            try:
                user_response = supabase.auth.get_user(access_token)
                supabase_user = user_response.user
                
                if not supabase_user:
                    return Response(
                        {'error': 'Invalid or expired token'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                    
            except Exception as token_error:
                logger.warning(f"Token validation failed: {str(token_error)}")
                return Response(
                    {'error': 'Invalid or expired session'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Token is valid, get user data
            user_email = supabase_user.email
            account = Account.objects.filter(email=user_email).first()
            
            if not account:
                return Response(
                    {'error': 'Account not found in system'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Serialize and return user data
            serializer = UserAccountSerializer(account)
            
            return Response({
                'user': serializer.data,
                'access_token': new_access_token,
                'refresh_token': refresh_response.session.refresh_token,
                'expires_at': refresh_response.session.expires_at,
                'message': 'User Data retrieved successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User retrieval error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to retrieve user data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MobileValidateTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            access_token = request.data.get('access_token')
            
            if not access_token:
                return Response(
                    {'error': 'Access token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info("Validating access token...")
            
            # Validate token with Supabase
            try:
                user_response = supabase.auth.get_user(access_token)
                supabase_user = user_response.user
                
                if supabase_user:
                    logger.info(f"Token is valid for user: {supabase_user.email}")
                    
                    # Get user from database
                    account = Account.objects.filter(email=supabase_user.email).first()
                    
                    if not account:
                        return Response(
                            {'error': 'Account not found in system'},
                            status=status.HTTP_404_NOT_FOUND
                        )

                    # Token is valid, return user data
                    serializer = UserAccountSerializer(account)
                    return Response({
                        'user': serializer.data,
                        'valid': True,
                        'message': 'Token is valid'
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'valid': False,
                        'message': 'Token is invalid or expired'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                    
            except Exception as token_error:
                logger.info(f"Token validation failed: {str(token_error)}")
                return Response({
                    'valid': False,
                    'message': 'Token is invalid or expired'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Token validation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MobileLogoutView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Get access token from Authorization header
            auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            
            if auth_header and auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
                
                try:
                    # Sign out from Supabase
                    supabase.auth.sign_out(access_token)
                    logger.info("User signed out successfully")
                except Exception as logout_error:
                    logger.warning(f"Supabase logout error: {str(logout_error)}")
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}", exc_info=True)
            # Return success even if there's an error, as logout should always succeed from client perspective
            return Response({
                'message': 'Logout completed'
            }, status=status.HTTP_200_OK)


