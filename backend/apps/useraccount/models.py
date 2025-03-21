# from django.contrib.auth.models import AbstractUser
# from django.db import models

# class UserAccount(AbstractUser):
#     email = models.EmailField(unique=True)  # Use EmailField for email
#     date_created = models.DateField(auto_now_add=True)

#     def __str__(self):
#         return self.email

from django.db import models
from django.contrib.auth.models import User

class UserAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username