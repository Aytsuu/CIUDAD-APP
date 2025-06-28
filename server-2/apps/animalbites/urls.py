from django.urls import path
from .views import * # Ensure all your views are imported

urlpatterns = [
    path('details/', AnimalbiteDetailsView.as_view(), name='animalbite-details'),
    path('referral/', AnimalbiteReferralView.as_view(), name='animalbite-referral'),
    path('patient-details/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details'),
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), 
    path('patient-record-counts/', AnimalBitePatientRecordCountView.as_view(), name='animalbite-patient-record-counts'),
    path('patient-details/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details'),
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), 
    path('create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animalbite-record'),
    path('patient/<str:pat_id>/animalbite_count/',get_animalbite_count, name='patient-animalbite-count'),
]