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
    path('patient-details/<str:patient_id>/', AnimalbitePatientDetailsView.as_view(), name='animalbite-patient-details-by-id'), # New path for filtering by patient_id
    
    # CRUD operations - try the raw SQL version first
    path('create-record/', CreateAnimalBiteRecordView.as_view(), name='create-animalbite-record'),
    # Alternative endpoint if the first one doesn't work
    # path('create-record-alt/', CreateAnimalBiteRecordAlternativeView.as_view(), name='create-animalbite-record-alt'),
    path('update-record/<int:bite_id>/', UpdateAnimalBiteRecordView.as_view(), name='update-animalbite-record'),
    
    # Delete operations
    path('patient/<int:patient_id>/delete/', DeleteAnimalBitePatientView.as_view(), name='delete-patient'),
    path('record/<int:bite_id>/delete/', DeleteAnimalBiteRecordView.as_view(), name='delete-record'),
]
