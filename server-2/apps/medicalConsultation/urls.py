from django.urls import path
from .views import *

urlpatterns=[
    path('all-medical-consultation-record/', PatientMedConsultationRecordView.as_view(), name='patient-medical-consultation-record'),
    path('medical-consultation-record/', MedicalConsultationRecordView.as_view(), name='medical-consultation-record'),
    path('view-medcon-record/<str:pat_id>/', ViewMedicalConsultationRecordView.as_view(), name='medical-consultation-record-detail'),
    path('pending-medcon-record/',PendingPatientMedConsultationRecordView.as_view(),name='pending-medcon-record'),
    path('view-medconpending-record/<str:pat_id>/', ViewMedicalWithPendingRecordView.as_view(), name='medical-consultation-record-detail'),
]