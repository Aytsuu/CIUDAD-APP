from django.urls import path
from .views.update_complaint import *
from .views.raise_issue import *
from .views.complaint_view import *
from .views.all_resident import *
from .views.create_complaint import *
from .views.complaint_analytics import *

urlpatterns = [
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('resident/list/', ResidentsComplaintListView.as_view(), name='resident-complaint-list'),
    path('view/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('analytics/cards/', ComplaintCardAnalyticsView.as_view(), name='complaint-card-analytics'),
    path('analytics/charts/', ComplaintChartAnalyticsView.as_view(), name='complaint-chart-analytics'),
    
    # Searching
    path('residentLists/', AllResidentsView.as_view(), name='all-residents'),
    
    # Update
    path('<int:comp_id>/update/', ComplaintUpdateView.as_view(), name='complaint-update'),
    
    # Sending the blotter to the ServiceChargeRequest
    path('<int:comp_id>/raiseissue/', ServiceChargeRequestCreateView.as_view(), name='complaint-issue-raise'),
]