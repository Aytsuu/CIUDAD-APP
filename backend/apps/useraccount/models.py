from django.db import models

class UserAccount(models.Model):
    email = models.CharField(max_length=255, unique=True)  
    dateCreated = models.DateField(auto_now_add=True)
    password = models.CharField(max_length=200) 
    username = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self.email