from django.urls import path
from .views import * # Ensure all your views are imported

urlpatterns = [
    # Bite Details
    path('details/', AnimalbiteDetailsView.as_view(), name='animalbite-details'),
    # Referrals
    path('referral/', AnimalbiteReferralView.as_view(), name='animalbite-referral'),
    
    # Complete patient data (used for individual patient details)
    path('patient-details/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details'),
    # Path for filtering by patient_id (CharField) - this supports fetching all records for an individual patient
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), 
    
    # New: Endpoint for unique patients with record counts (for overall list display)
    path('patient-record-counts/', AnimalBitePatientRecordCountView.as_view(), name='animalbite-patient-record-counts'),
    
    path('create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animalbite-record'),
    path('patient/<str:pat_id>/animalbite_count/',get_animalbite_count, name='patient-animalbite-count'),
    
    # Duplicated paths, consider consolidating if possible
    path('animalbites/create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animal-bite-record'),
    path('animalbites/patient-details/', AnimalbitePatientDetailsView.as_view(), name='animal-bite-patient-details'),
]