#KANI 4TH
#AFTER ANI KAY COMMAND PYTHON MANAGE.PY MAKEMIGRATIONS WASTE 
#AFTER KAY PYTHON MANAGE.PY MIGRATE WASTE

from django.urls import path
from .views import DonationView, DonationDetailView
urlpatterns = [
    path("donation-record/", DonationView.as_view(), name="donation-record"),
    path("donation-record/<int:don_num>/", DonationDetailView.as_view(), name="donation-record-update"),
    path("donation-record/<int:don_num>/", DonationDetailView.as_view(), name="donation-record-delete"),
]