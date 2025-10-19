from django.urls import path
from .view import *
from .views.update_complaint_view import *
from .views.raise_issue import *
# from .views.archive_complaint_view import *
# from .views.search_complaint_view import *
from .views.create_complaint_view import *

urlpatterns = [
    
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('view/', ComplaintDetailView.as_view(), name='complaint-detail'),

    # Archive
    path('<int:comp_id>/restore', RestoreComplaintView.as_view(), name='complaint-restore'),
    path('<int:pk>/archive/', ArchiveComplaintView.as_view(), name='archive-complaint'),
    path('archived/', ArchivedComplaintsView.as_view(), name='archived-complaints'),
    
    # Searching
    path('residentLists/', AllResidentsView.as_view(), name='all-residents'),
    
    # Update
    path('<int:comp_id>/update/', ComplaintUpdateView.as_view(), name='complaint-update'),
    
    # Sending the blotter to the ServiceChargeRequest
    # path('<int:comp_id>/raiseissue/', ServiceChargeRequestCreateView.as_view(), name='complaint-issue-raise'),
]