from django.urls import path
from .views import *


urlpatterns = [
    path('vaccination-record/', VaccineRecordView.as_view(), name='vaccination-record'),
    # path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vaccination-history/', VaccinationHistoryView.as_view(), name='vaccination-history'),
  
#   all records view
    path('all-vaccine-records/', PatientVaccinationRecordsView.as_view(), name='services-records-list'),
    path('indiv-patient-record/<int:pat_id>/', VaccinationRecordByPatientView.as_view(), name='patient-record'),
    
    # # UPDATE DELETE
    path('vaccination-record/<int:vacrec_id>/', DeleteUpdateVaccinationRecordView.as_view(), name='vaccination-record-detail'),
    # path('vital-signs/<int:vital_id>/', DeleteUpdateVitalSignsView.as_view(), name='vital-signs-detail'),
    path('vaccination-history/<int:vachist_id>/', DeleteUpdateVaccinationHistoryView.as_view(), name='vaccination-history-detail'),
]