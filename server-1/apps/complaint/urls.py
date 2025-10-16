from django.urls import path
from .views.update_complaint_view import *
from .views.raise_issue import *
from .views.complaint_detail_view import *
from .views.all_complaint_view import *
from .views.all_resident_view import *
from .views.create_complaint_view import *

urlpatterns = [
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('view/', ComplaintDetailView.as_view(), name='complaint-detail'),
    
    # Searching
    path('residentLists/', AllResidentsView.as_view(), name='all-residents'),
    
    # Update
    path('<int:comp_id>/update/', ComplaintUpdateView.as_view(), name='complaint-update'),
    
    # Sending the blotter to the ServiceChargeRequest
    path('<int:comp_id>/raiseissue/', ServiceChargeRequestCreateView.as_view(), name='complaint-issue-raise'),
]