from . import views
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
]