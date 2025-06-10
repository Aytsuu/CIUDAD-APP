from django.urls import path
from .views import *


urlpatterns = [
     path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
     path('patient/', PatientView.as_view(), name='patient'),
     path('patient/<str:pat_id>/', PatientDetailView.as_view(), name='patient-detail'),
 
 # # UPDATE DELETE
     path('patient-record/<int:patrec_id>/', DeleteUpdatePatientRecordView.as_view(), name='patient-record-detail'),
 
 
     path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
     path('vital-signs/<int:vital_id>/', DeleteUpdateVitalSignsView.as_view(), name='vital-signs-detail'),

     path("obstetrical_history/", ObstetricalHistoryView.as_view(), name="obstetricalhistory"),
     
     path("spouse/", SpouseListView.as_view(), name='spouse'),
	 path("spouse/create/", SpouseCreateView.as_view(), name='spouse-create'),
     path("spouse/<int:spouse_id>/", SpouseDetailView.as_view(), name='spouse-detail'),

     path('follow-up-visit/', FollowUpVisitView.as_view(), name='follow-up-visit'),
     path('follow-up-visit/<int:followv_id>/', DeleteUpdateFollowUpVisitView.as_view(), name='follow-up-visit-detail'),
     
     path('body-measurements/', BodyMeasurementView.as_view(), name='body-measurements'),
     path('body-measurements/<int:body_id>/', DeleteUpdateBodyMeasurementView.as_view(), name='body-measurements-detail'),
     path("findings/", FindingView.as_view(), name="findings"),
     path('findings/<int:find_id>/', DeleteUpdateFindingView.as_view(), name='findings-detail'),
     path("physial-examination/", PhysicalExaminationView.as_view(), name="physical-examination"),
     path('physial-examination/<int:pe_id>/', DeleteUpdatePhysicalExaminationView.as_view(), name='physical-examination-detail'),
     path("physical-exam-list/", PhysicalExamListView.as_view(), name="physical-examination-list"),
     path('physical-exam-list/<int:pel_id>/', DeleteUpdatePhysicalExamListView.as_view(), name='physical-examination-list-detail'),

]