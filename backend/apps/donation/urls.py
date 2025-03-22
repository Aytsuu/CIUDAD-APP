#KANI 4TH
#AFTER ANI KAY COMMAND PYTHON MANAGE.PY MAKEMIGRATIONS WASTE 
#AFTER KAY PYTHON MANAGE.PY MIGRATE WASTE

from django.urls import path
from .views import *

urlpatterns = [
    path("donation-record/", DonationView.as_view(), name="donation-record"),
]