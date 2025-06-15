from django.urls import path
from .views import *


urlpatterns = [
    path('vaccination-record/', VaccineRecordView.as_view(), name='vaccination-record'),
    # path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vaccination-history/', VaccinationHistoryView.as_view(), name='vaccination-history'),
  
#   all records view
    path('all-vaccine-records/', PatientVaccinationRecordsView.as_view(), name='services-records-list'),
    path('indiv-patient-record/<str:pat_id>/', VaccinationHistorRecordView.as_view(), name='patient-record'),
    
    
    # # UPDATE DELETE
    path('vaccination-record/<int:vacrec_id>/', DeleteUpdateVaccinationRecordView.as_view(), name='vaccination-record-detail'),
    
    
    # path('vital-signs/<int:vital_id>/', DeleteUpdateVitalSignsView.as_view(), name='vital-signs-detail'),
    path('vaccination-history/<int:vachist_id>/', DeleteUpdateVaccinationHistoryView.as_view(), name='vaccination-history-detail'),
    path('unvaccinated-vaccines/<str:pat_id>/', UnvaccinatedVaccinesView.as_view(), name='unvaccinated-vaccines'),
    path('check-vaccine/<str:pat_id>/<int:vac_id>/', CheckVaccineExistsView.as_view(), name='check-vaccine'),
    path('patient-vaccine-followups/<str:pat_id>/', PatientVaccineFollowUpView.as_view(), name='patient-vaccine-followups'),
    path('patient-info/<str:patrec_pat_id>/', GetPatientInfoFromVaccinationRecord.as_view()),
    path('vacrec-count/<str:pat_id>/', GetVaccinationCountView.as_view(), name='get-vaccination-count'),
    path('residents/unvaccinated/', GetAllResidentsNotVaccinated.as_view(), name='unvaccinated-residents'),

]