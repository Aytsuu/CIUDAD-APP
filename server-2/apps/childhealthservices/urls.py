from django.urls import path
from .views import *

urlpatterns = [
    path('records/', ChildHealthRecordsView.as_view(), name='child-health-records'),
    path('history/', ChildHealthHistoryView.as_view(), name='child-health-history'),
    path('notes/', ChildHealthNotesView.as_view(), name='child-health-notes'),
    path('supplements/', ChildHealthSupplementsView.as_view(), name='child-health-supplements'),
    path('nutritional-status/', NutritionalStatusView.as_view(), name='nutritional-status'),
    path('exclusive-bf-check/', ExclusiveBFCheckView.as_view(), name='exclusive-bf-check'),
    path('immunization-history/', ChildHealthImmunizationHistoryView.as_view(), name='immunization-history'),
]
