from django.urls import path
from .views import *


urlpatterns = [
    path('vaccination-record/', VaccineRecordView.as_view(), name='vaccination-record'),
    path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vaccination-history/', VaccinationHistoryView.as_view(), name='vaccination-history'),
  
#   all records view
    path('all-vaccine-records/', PatientVaccinationRecordsView.as_view(), name='services-records-list'),
   
]