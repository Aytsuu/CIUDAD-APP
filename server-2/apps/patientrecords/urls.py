from django.urls import path
from .views import *


urlpatterns = [
 path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
 path('patient/', PatientView.as_view(), name='patient'),
 
 # # UPDATE DELETE
path('patient-record/<int:patrec_id>/', DeleteUpdatePatientRecordView.as_view(), name='patient-record-detail'),
 
 
     path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
     path('vital-signs/<int:vital_id>/', DeleteUpdateVitalSignsView.as_view(), name='vital-signs-detail'),

     path("obstetrical_history/", ObstetricalHistoryView.as_view(), name="obstetricalhistory"),
]