from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError("Email field is required")
        email = self.normalize_email(email)
        user = self.model(acc_email=email, **extra_fields)
        user.set_password(password)  # Hash password before saving
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class Account(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    acc_id = models.CharField(max_length=20, unique=True, editable=False)
    acc_email = models.EmailField(unique=True)
    acc_password = models.CharField(max_length=200)  
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AccountManager()

    USERNAME_FIELD = 'acc_email' 
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if not self.acc_id:
            self.acc_id = f"ACC-{self.id:05d}" 
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'account'
