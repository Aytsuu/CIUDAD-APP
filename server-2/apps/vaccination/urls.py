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
    path('check-vaccine/<str:pat_id>/<int:vac_id>/', CheckVaccineExistsView.as_view(), name='check-vaccine'),
    path('patient-vaccine-followups/<str:pat_id>/', PatientVaccineFollowUpView.as_view(), name='patient-vaccine-followups'),
    path('child-followups/<str:pat_id>/', ChildHealthVaccineFollowUpView.as_view(), name='child-followups'),
    path('patient-info/<str:patrec_pat_id>/', GetPatientInfoFromVaccinationRecord.as_view()),
    path('vacrec-count/<str:pat_id>/', GetVaccinationCountView.as_view(), name='get-vaccination-count'),
    path('count-vaccinated/', CountVaccinatedByPatientTypeView.as_view(), name='count-vaccinated'),
    path('forwarded-vaccination-records/', ForwardedVaccinationHistoryView.as_view(), name='forwarded-vaccination-records'),
    path('forwarded-vaccination-count/', ForwardedVaccinationCountView.as_view(), name='pat_vaccination_records'),
    
    
    path('count-scheduled-vaccinations/', CountScheduledVaccinationView.as_view(), name='count_scheduled_vaccinations'),
      
    path('child-vaccination/', BulkVaccinationCreateView.as_view(), name='child-vaccination'),
    
    
    
    path('residents/unvaccinated/', GetAllResidentsNotVaccinated.as_view(), name='unvaccinated-residents'),
    path('unvaccinated-vaccines/<str:pat_id>/', UnvaccinatedVaccinesView.as_view(), name='unvaccinated-vaccines'),
    path('unvaccinated-residents-summary/', UnvaccinatedVaccinesSummaryView.as_view(), name='unvaccinated-residents-summary'),
    path('unvaccinated-residents-detailssummary/<int:vac_id>/', UnvaccinatedVaccinesDetailsView.as_view(), name='unvaccinated-residents-details'),

    
    path('vaccination-records/monthly/', MonthlyVaccinationSummariesAPIView.as_view(), name='monthly_vaccination_records'),
    path('vaccination-reports/<str:month>/', MonthlyVaccinationRecordsDetailAPIView.as_view(), name='vaccination-reports'),
    path('vaccination-records/monthly/chart/<str:month>/', MonthlyVaccinationChart.as_view(), name='vaccination_records_list'),
    path('vaccination-totalrecords/', VaccinationTotalCountAPIView.as_view(), name='vaccination_total_count'),

    
    
    # =============================BACKEND CREATION UPDATED=================================
    path('submit-vaccination-records/', VaccinationSubmissionView.as_view(), name='vaccination-records-list'),
    path("vaccination-completion/",VaccinationCompletionAPIView.as_view(),name="vaccine-completion-create"),
    path('to-be-administered/<str:assigned_to>/', TobeAdministeredVaccinationView.as_view(), name='administered_vaccination'),

    


]