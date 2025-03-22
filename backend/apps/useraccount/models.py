from django.db import models
from django.utils import timezone

class UserAccount(models.Model):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Store hashed passwords
    dateCreated = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username