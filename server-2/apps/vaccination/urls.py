from django.urls import path
from .views import *


urlpatterns = [
    path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
    path('vaccination-record/', VaccineRecordView.as_view(), name='vaccination-record'),
    path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vaccination-history/', VaccinationHistoryView.as_view(), name='vaccination-history'),
    path('services-records/', ServicesRecordsView.as_view(), name='services-records'),
  
#   all records view
    path('all-vaccine-records/', VaccinationRecordsView.as_view(), name='services-records-list'),
    # path('individual-vaccination-records/<int:pat_id>/', PatientDetailView.as_view(), name='individual-vaccination-records'),
   
]