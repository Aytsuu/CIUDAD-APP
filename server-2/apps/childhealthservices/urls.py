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
    path('nutritional-status/', NutritionalStatusView.as_view(), name='nutritional-status'),
    path('exclusive-bf-check/', ExclusiveBFCheckView.as_view(), name='exclusive-bf-check'),
    path('immunization-history/', ChildHealthImmunizationHistoryView.as_view(), name='immunization-history'),
   path('child-vitalsigns/', ChildHealthVitalSignsView.as_view(), name='child-vitalsigns'),
   
   

]

