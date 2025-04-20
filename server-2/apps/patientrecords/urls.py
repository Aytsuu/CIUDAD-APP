from django.urls import path
from .views import *


urlpatterns = [
 path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
 path('patient/', PatientView.as_view(), name='patient'),
 
 # # UPDATE DELETE
path('patient-record/<int:patrec_id>/', DeleteUpdatePatientRecordView.as_view(), name='patient-record-detail'),
 
]