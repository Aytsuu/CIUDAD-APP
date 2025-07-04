from django.urls import path
from .views import *

urlpatterns = [
    path("donation-record/", DonationView.as_view(), name="donation-record"),
    path("donation-record/<int:don_num>/", DonationDetailView.as_view(), name="donation-record-update"),
    # path("donation-record/<int:don_num>/", DonationDetailView.as_view(), name="donation-record-delete"),
    path('total-monetary/', MonetaryDonationTotalView.as_view(), name='monetary-donations-total'),
    path("personal-list/", PersonalListView.as_view(), name="personal-list"),
    path("create-payment/", CreateDonationPayment.as_view()),  # Moved here
    path("payment-webhook/", payment_webhook),
    path("online-donations/", OnlineDonationListView.as_view()),
    path("payment-status/<str:payment_intent_id>/", PaymentStatus.as_view()),
]