from django.urls import path
from .views import *


urlpatterns = [
 path('patient-record/', PatientRecordsView.as_view(), name='patient-record'),
]