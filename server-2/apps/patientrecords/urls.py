from django.urls import path
from .views.patient_views import *
from .views.vitalsigns_views import *
from .views.obstetrical_views import *
from .views.spouse_views import *
from .views.followvisits_views import *
from .views.bodymeasurement_views import *
from .views.findings_views import *
from .views.physicalexam_views import *
from .views.medicalhistory_views import *
from .views.patient_views import *
from .views.illness_views import *
from .views.disability_views import *
from apps.administration.views.staff_views import HealthStaffListView

urlpatterns = [
    path('residents-available/', get_resident_profile_list, name='residents-available-list'),

    path('patient-record/', PatientRecordView.as_view(), name='patient-record'),
    path('patients/', PatientListView.as_view(), name='patient-list'),
    path('patient/view/create/', PatientView.as_view(), name='patient-create-view'),
    path('patient/<str:pat_id>/', PatientDetailView.as_view(), name='patient-detail'),
	 
    path('transient/address/', TransientAddressView.as_view(), name='transient-address'),

    path('update-transient/<str:trans_id>/', UpdateTransientView.as_view(), name='update-transient-patient'),


    path('vital-signs/', VitalSignsView.as_view(), name='vital-signs'),
    path('vital-signs/latest/<str:pat_id>/', GetLatestVitalSignsView.as_view(), name='latest-vital-signs'),
    
    path("obstetrical_history/", ObstetricalHistoryView.as_view(), name="obstetricalhistory"),
    
    path("spouse/", SpouseListView.as_view(), name='spouse'),
    path("spouse/create/", SpouseCreateView.as_view(), name='spouse-create'),
    path("spouse/<int:spouse_id>/", SpouseDetailView.as_view(), name='spouse-detail'),

    path('follow-up-visit/', FollowUpVisitView.as_view(), name='follow-up-visit'),
    path('follow-up-visits-all/', AllFollowUpVisitsView.as_view(), name='follow-up-visits-all'),
    
    path('body-measurements/', BodyMeasurementView.as_view(), name='body-measurements'),
    path('body-measurements/<str:pat_id>/', BodyMeasurementView.as_view(), name='body-measurements-by-patient'),
   
    path("findings/", FindingView.as_view(), name="findings"),

    path('followup-complete/<str:pat_id>/', GetCompletedFollowUpVisits.as_view(), name='followup-complete'),
    path('followup-pending/<str:pat_id>/', GetPendingFollowUpVisits.as_view(), name='followup-pending'),
    path('previous-measurement/<str:pat_id>/', GetPreviousHeightWeightAPIView.as_view(), name='previous-height-weight'),
   
    path('illness/', IllnessView.as_view(), name="illness"),
   
    path('pe-result/', PEResultCreateView.as_view(), name='pe-result'),
    path('pe-section/', PESectionView.as_view(), name='pe_section'),
    path('pe-option/', PEOptionView.as_view(), name='pe_option'),
   
    path('medical-history/', MedicalHistoryView.as_view(), name='medical-history'),
   
    # UPDATE/ DELETE
    path('vital-signs/<int:vital_id>/', DeleteUpdateVitalSignsView.as_view(), name='vital-signs-detail'),
    path('patient-record/<int:patrec_id>/', DeleteUpdatePatientRecordView.as_view(), name='patient-record-detail'),
    path('update-pe-option/<int:pe_option_id>/',DeleteUpdatePEOptionView.as_view(), name='update_pe_option'),
    path('findings/<int:find_id>/', DeleteUpdateFindingView.as_view(), name='findings-detail'),
    path('follow-up-visit/<int:followv_id>/', DeleteUpdateFollowUpVisitView.as_view(), name='follow-up-visit-detail'),
    path('body-measurements/<int:body_id>/', DeleteUpdateBodyMeasurementView.as_view(), name='body-measurements-detail'),
   
    path('medical-history/<int:patrec>/', DeleteMedicalHistoryByPatrecView.as_view(), name='updel-medical-history'),

    path('physical-exam-result/<int:find_id>/', DeletePEResultByFindingView.as_view(), name='delete-peresults'),

    #DISABLITY
    
    # path('disability/', ListDisabilityView.as_view(), name='list-disability'),
    # path('patient-disability/', PatientDisabilityView.as_view(), name='patient-disability'),
   
    # HEALTH STAFF

]

