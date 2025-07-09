
# ]
from django.urls import path
from .views import *

urlpatterns = [
    # Bite Details
    path('details/', AnimalbiteDetailsView.as_view(), name='animalbite-details'),
    # Referrals
    path('referral/', AnimalbiteReferralView.as_view(), name='animalbite-referral'),
    
    # Complete patient data
    path('patient-details/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details'),
    # Path for filtering by patient_id (CharField) - this supports individual.tsx
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), 
    
    path('create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animalbite-record'),
    path('patient/<str:pat_id>/animalbite_count/',get_animalbite_count, name='patient-animalbite-count'),
    path('animalbites/create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animal-bite-record'),
    path('animalbites/patient-details/', AnimalbitePatientDetailsView.as_view(), name='animal-bite-patient-details'),
    path('patient-record-counts/', AnimalBitePatientRecordCountView.as_view(), name='animalbite-patient-record-counts'),
    path('patient-summary/', AnimalBitePatientSummaryViewORM.as_view(), name='animalbite-patient-summary'),  # Use ORM version
    path('patient-summary-sql/', AnimalBitePatientSummaryView.as_view(), name='animalbite-patient-summary-sql'),  # SQL version if needed
]