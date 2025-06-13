# from django import views
# from django.urls import include, path
# from .views import *

# urlpatterns = [
#     path('details/', AnimalbiteDetailsView.as_view()),
#     path('referral/', AnimalbiteReferralView.as_view()),

#     # New endpoint for complete patient data
#     path('patient-details/', AnimalbitePatientDetailsView.as_view()),

#     #Delete animal bite record
#     path('patient/<int:patient_id>/delete/', DeleteAnimalBitePatientView.as_view(), name='delete-patient'),
#     path('record/<int:bite_id>/delete/', DeleteAnimalBiteRecordView.as_view(), name='delete-record'),
#     path('details/<int:bite_id>/', AnimalbiteDetailsDeleteView.as_view()),


# ]
from django.urls import path
from .views import *

urlpatterns = [
    # Bite Details
    path('details/', AnimalbiteDetailsView.as_view(), name='animalbite-details'),
    path('details/<int:bite_id>/', AnimalbiteDetailsDeleteView.as_view(), name='animalbite-details-delete'),
    
    # Referrals
    path('referral/', AnimalbiteReferralView.as_view(), name='animalbite-referral'),
    
    # Complete patient data
    path('patient-details/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details'),
    # Path for filtering by patient_id (CharField) - this supports individual.tsx
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), 
    
    # CRUD operations
    path('create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animalbite-record'),
    path('update-record/<int:bite_id>/', UpdateAnimalBiteRecordView.as_view(), name='update-animalbite-record'),
    
    # Delete operations
    # These URLs use string patient_id (pat_id) for patient deletion and int bite_id for record deletion
    path('patient/<str:patient_id>/delete/', DeleteAnimalBitePatientView.as_view(), name='delete-patient'),
    path('record/<int:bite_id>/delete/', DeleteAnimalBiteRecordView.as_view(), name='delete-record'),
    
    # Redundant but kept for safety if other parts use these specific paths
    path('animalbites/create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animal-bite-record'),
    path('animalbites/patient-details/', AnimalbitePatientDetailsView.as_view(), name='animal-bite-patient-details'),
    path('animalbites/update-record/<int:bite_id>/', UpdateAnimalBiteRecordView.as_view(), name='update-animal-bite-record'),
    path('animalbites/patient/<str:patient_id>/delete/', DeleteAnimalBitePatientView.as_view(), name='delete-animal-bite-patient'),
    path('animalbites/record/<int:bite_id>/delete/', DeleteAnimalBiteRecordView.as_view(), name='delete-animal-bite-record'),
]
