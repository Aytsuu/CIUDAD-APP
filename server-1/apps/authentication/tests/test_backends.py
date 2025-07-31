import pytest
from django.test import RequestFactory
from rest_framework.exceptions import AuthenticationFailed
from apps.authentication.backends import SupabaseAuthBackend
from apps.account.models import Account
import jwt 
from uuid import uuid
from unittest.mock import patch

@pytest.mark.django_db
class TestSupabaseAuthBackend:
    def setup_method(self):
        self.backend = SupabaseAuthBackend()
        self.factory = RequestFactory()
        self.valid_token = 'valid_token_123'
        self.invalid_token = 'invalid_token_123'
        
    def test_valid_token_authenticates_user(self, mocker):
        mock_decode = mocker.patch(
            "jwt.decode",
            return_value = {
                'sub':"123e4567-e89b-12d3-a456-426614174000",
                'email': "test@example.com",
                'user_metadata': {"username", "testuser"},
            },
        )
    
        request = self.factory.get(
            "/", HTTP_AUTHORIZATION=f"Bearer {self.valid_token}"
        )
        
        user, _ = self.backend.authenticate(request)
        
        assert user.email == "test@example.com"
        assert Account.objects.filter(email="test@example.com").exists()
        