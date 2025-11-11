from django.urls import path
from .views import *

urlpatterns = [
    path("donation-record/", DonationView.as_view(), name="donation-record"),
    path("donation-record/<str:don_num>/", DonationDetailView.as_view(), name="donation-record-update"),
    path('total-monetary/', MonetaryDonationTotalView.as_view(), name='monetary-donations-total'),
    path("personal-list/", PersonalListView.as_view(), name="personal-list"),
    path('dist/staff/', StaffListView.as_view(), name='staff-list'),
]