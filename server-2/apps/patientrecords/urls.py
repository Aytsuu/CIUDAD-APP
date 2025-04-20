from django.urls import path
from .views import *


urlpatterns = [
 path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
]