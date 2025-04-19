from django.urls import path
from .views import *


urlpatterns = [
    path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
    path('vaccination-record/', VaccineRecordView.as_view(), name='vaccination-record'),
    path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vaccination-history/', VaccinationHistoryView.as_view(), name='vaccination-history'),
    path('services-records/', ServicesRecordsView.as_view(), name='services-records'),
  
#   all records view
    path('all-vaccine-records/', PatientVaccinationRecordsView.as_view(), name='services-records-list'),
    # path('indv-vaccine-records/<int:pat_id>/', InvPatientVaccinationRecordsView.as_view(), name='individual-vaccination-records'),
   
]