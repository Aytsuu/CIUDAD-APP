from django.urls import path
from .views import *

urlpatterns = [
    
    path('records/', ChildHealthRecordsView.as_view(), name='child-health-records'),
    path('history/', ChildHealthHistoryView.as_view(), name='child-health-history'),
    path('history/<int:chrec_id>/', IndivChildHealthHistoryView.as_view(), name='child-health-history-detail'),
    path('historyindiv/<int:chhist_id>/', EditIndivChildHealthHistoryView.as_view(), name='child-health-history-detail'),
    path('notes/<int:chnotes_id>/', ChildHealthNotesUpdateView.as_view(), name='child-health-notes-update'),
    path('notes/', ChildHealthNotesView.as_view(), name='child-health-notes'),
    path('supplements/', ChildHealthSupplementsView.as_view(), name='child-health-supplements'),
    path('supplement-status/', ChildHealthSupplementStatusView.as_view(), name='child-health-supplement-status'),
    path('update-supplement-status/', UpdateChildHealthSupplementsStatusView.as_view(), name='update-child-health-supplement-status'),
    path('nutritional-status/', NutritionalStatusView.as_view(), name='nutritional-status'),
    path('nutritional-summary/<int:chrec_id>/',ChildHealthNutrionalStatusListView.as_view(),name='child-nutrional-status'),
   
    path('exclusive-bf-check/', ExclusiveBFCheckView.as_view(), name='exclusive-bf-check'),
    path('immunization-history/', ChildHealthImmunizationHistoryView.as_view(), name='immunization-history'),
    path('child-vitalsigns/', ChildHealthVitalSignsView.as_view(), name='child-vitalsigns'),
    
    path('child-health-record-count/<str:pat_id>/', GeChildHealthRecordCountView.as_view(), name='child-health-record-count'),
    path('child-health-records/by-patient/<str:pat_id>/', ChildHealthRecordByPatIDView.as_view(), name='pat_child_health_records'),
    path('child-immunization-status/',ChildHealthImmunizationStatusListView.as_view(), name='child-immunization-status'),
    path('child-immunization-count/', ChildHealthImmunizationCountView.as_view(), name='child-health-immunization-count'),
]

