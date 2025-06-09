from django import views
from django.urls import include, path
from .views import *

urlpatterns = [
    path('details/', AnimalbiteDetailsView.as_view()),
    path('referral/', AnimalbiteReferralView.as_view()),

    # New endpoint for complete patient data
    path('patient-details/', AnimalbitePatientDetailsView.as_view()),

    #Delete animal bite record
    path('patient/<int:patient_id>/delete/', DeleteAnimalBitePatientView.as_view(), name='delete-patient'),
    path('record/<int:bite_id>/delete/', DeleteAnimalBiteRecordView.as_view(), name='delete-record'),
    path('details/<int:bite_id>/', AnimalbiteDetailsDeleteView.as_view()),


]
