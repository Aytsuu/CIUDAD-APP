from django.urls import path
from .views import *

urlpatterns = [
    path('service-charge-request/', ServiceChargeRequestView.as_view(), name='service-charge-request'),
    path('case-details/<int:sr_id>/', ServiceChargeRequestDetailView.as_view(), name='case-details'),
    path('case-activity/', CaseActivityView.as_view(), name='case-activity'),
    path('update-service-charge-request/<int:sr_id>/', UpdateServiceChargeRequestView.as_view(), name='update-service-charge-request'),
]
