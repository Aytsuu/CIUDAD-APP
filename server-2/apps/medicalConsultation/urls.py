from django.urls import path
from .views import *

urlpatterns=[
    path('all-medical-consultation-record/', PatientMedConsultationRecordView.as_view(), name='patient-medical-consultation-record'),
    path('medical-consultation-record/', MedicalConsultationRecordView.as_view(), name='medical-consultation-record'),
    path('view-medcon-record/<str:pat_id>/', ViewMedicalConsultationRecordView.as_view(), name='medical-consultation-record-detail'),
    path('pending-medcon-record/',PendingPatientMedConsultationRecordView.as_view(),name='pending-medcon-record'),
    path('view-medconpending-record/<str:pat_id>/', ViewMedicalWithPendingRecordView.as_view(), name='medical-consultation-record-detail'),
    path('update-medcon/<int:medrec_id>/', UpdateMedicalConsultationRecordView.as_view(), name='update-medical-consultation-record'),
    path('medcon-record-count/<str:pat_id>/', GetMedConCountView.as_view(), name='med-record-count'),
    path('pending-medcon-record-count/', PendingMedConCountView.as_view(), name='pending-med-record-count'),
    path('medcon-totalrecords/', MedicalConsultationTotalCountAPIView.as_view(), name='medcon-totalrecords'),
    
    
    path ('create-medical-consultation-record-step1/', CreateMedicalConsultationView.as_view(), name='create-medical-consultation-record'),
    path ('create-soap-form/', SoapFormSubmissionView.as_view(), name='create-medical-consultation-record-step2'),
    path('create-soap-form/childhealth/', ChildHealthSoapFormSubmissionView.as_view(), name='create-medical-consultation-record-step3'),
]