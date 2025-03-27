from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import uuid

class Account(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    dateCreated = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.username
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

class UserToken(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def get_or_create(cls, user):
        try:
            token = cls.objects.get(user=user)
        except cls.DoesNotExist:
            token = cls.objects.create(
                user=user,
                token=uuid.uuid4().hex
            )
        return token