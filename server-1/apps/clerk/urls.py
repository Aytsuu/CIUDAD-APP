from django.urls import path
from .views import *

urlpatterns = [
    path('service-charge-request/', ServiceChargeRequestView.as_view(), name='service-charge-request'),
]