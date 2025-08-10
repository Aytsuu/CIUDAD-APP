from django.urls import path
from .views import *

urlpatterns = [
    
    path('records/', ChildHealthRecordsView.as_view(), name='child-health-records'),
    path('history/', ChildHealthHistoryView.as_view(), name='child-health-history'),
    path('history/checkup/', CheckUPChildHealthHistoryView.as_view(), name='child-health-history-checkup'),
    path('history/pending-count/', PendingMedConChildCountView.as_view(), name='pending-medical-consultation-count'),
    path('update/history/<int:chhist_id>/', UpdateChildHealthHistoryView.as_view(), name='child-health-history-update'),
    path('history/<int:chrec_id>/', IndivChildHealthHistoryView.as_view(), name='child-health-history-detail'),
    path('historyindiv/<int:chhist_id>/', IndivChildHealthHistoryView.as_view(), name='child-health-history-detail'),
    path('notes/<int:chnotes_id>/', ChildHealthNotesUpdateView.as_view(), name='child-health-notes-update'),
    path('notes/', ChildHealthNotesView.as_view(), name='child-health-notes'),
    path('delete/notes/<int:chnotes_id>/', DeleteChildHealthNotesView.as_view(), name='delete-child-health-notes'),
    path('supplements/', ChildHealthSupplementsView.as_view(), name='child-health-supplements'),
    path('supplement-status/', ChildHealthSupplementStatusView.as_view(), name='child-health-supplement-status'),
    path('update-supplement-status/', UpdateChildHealthSupplementsStatusView.as_view(), name='update-child-health-supplement-status'),
    path('nutritional-status/', NutritionalStatusView.as_view(), name='nutritional-status'),
    path('nutritional-summary/<int:chrec_id>/',ChildHealthNutrionalStatusListView.as_view(),name='child-nutrional-status'),
   
    path('exclusive-bf-check/', ExclusiveBFCheckView.as_view(), name='exclusive-bf-check'),
    path('immunization-history/', ChildHealthImmunizationHistoryView.as_view(), name='immunization-history'),
    path('immunization-history/<int:imt_id>/', DeleteChildHealthImmunizationHistoryView.as_view(), name='immunization-history-delete'),
    path('child-vitalsigns/', ChildHealthVitalSignsView.as_view(), name='child-vitalsigns'),
    path('update/child-vitalsigns/<int:chvital_id>/', UpdateChildHealthVitalSignsView.as_view(), name='child-vitalsigns-detail'),
    
    path('child-health-record-count/<str:pat_id>/', GeChildHealthRecordCountView.as_view(), name='child-health-record-count'),
    path('child-health-records/by-patient/<str:pat_id>/', ChildHealthRecordByPatIDView.as_view(), name='pat_child_health_records'),
    path('child-immunization-status/',ChildHealthImmunizationStatusListView.as_view(), name='child-immunization-status'),
    path('child-immunization-count/', ChildHealthImmunizationCountView.as_view(), name='child-health-immunization-count'),
    
    # OPT TRACKING
    path('opt-tracking/', OPTTrackingViews.as_view(), name='opt-tracking'),
    path('opt-tracking/monthly/summaries/', MonthlyOPTChildHealthSummariesAPIView.as_view(), name='opt-tracking-detail'),
    path('opt-tracking/current-last-month/count', ChildHealthCurrentandLastMonthCountAPIView.as_view(), name='opt-tracking-detail'),
    path('opt-tracking/reports/<str:month>/', MonthlyOPTChildHealthReportAPIView.as_view(), name='opt-tracking-detail'),
    path('opt-tracking/summary/', OPTSummaryAllMonths.as_view(), name='opt-tracking-monthlyoverall'),
    
    path('opt-tracking/summary/<str:month>/', MonthlyOPTSummaryDetailedReport.as_view(), name='opt-tracking-detail-overall'),
]
