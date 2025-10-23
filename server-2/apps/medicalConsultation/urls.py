from django.urls import path
from .views import *

urlpatterns=[
    path('all-medical-consultation-record/', PatientMedConsultationRecordView.as_view(), name='patient-medical-consultation-record'),
    path('view-medcon-record/<str:pat_id>/', ViewMedicalConsultationRecordView.as_view(), name='medical-consultation-record-detail'),
    path('pending-medcon-record/',PendingPatientMedConsultationRecordView.as_view(),name='pending-medcon-record'),
    path('view-medconpending-record/<str:pat_id>/', ViewMedicalWithPendingRecordView.as_view(), name='medical-consultation-record-detail'),
    path('medcon-record-count/<str:pat_id>/', GetMedConCountView.as_view(), name='med-record-count'),
    path('pending-medcon-record-count/', PendingMedConCountView.as_view(), name='pending-med-record-count'),
    
    path ('create-medical-consultation-record-step1/', CreateMedicalConsultationView.as_view(), name='create-medical-consultation-record'),
    path ('create-soap-form/', SoapFormSubmissionView.as_view(), name='create-medical-consultation-record-step2'),
    path('create-soap-form/childhealth/', ChildHealthSoapFormSubmissionView.as_view(), name='create-medical-consultation-record-step3'),
    
    path('combined-health-records/<str:assigned_to>/', CombinedHealthRecordsView.as_view(), name='combined-health-records-assigned'),
    path('family-medhistory/<str:pat_id>/', FamilyPHIllnessCheckAPIView.as_view(), name='family-medhistory'),
    
    
    path('available-slots/', AvailableMedicalConsultationSlotsView.as_view(), name='available-slots'),
    path('book-appointment/', MedicalConsultationBookingView.as_view(), name='book-appointment'),
    path('user-appointments/', UserAppointmentsView.as_view(), name='user-appointments'),
    path('cancel-appointment/<int:appointment_id>/', CancelAppointmentView.as_view(), name='cancel-appointment'),
    path('pending-medicalcon-appointments/', PendingMedicalUserAppointmentsView.as_view(), name='pending-appointment'),
    path('confirmed-medicalcon-appointments/', ConfirmedMedicalUserAppointmentsView.as_view(), name='pending-appointment'),

    path('action-appointment/<int:pk>/', ActionAppointmentView.as_view(), name='reject-appointment'),
    path('medical-consultation-stats/', MedicalUserAppointmentsView.as_view(), name='medical-consultation-stats'),
]  