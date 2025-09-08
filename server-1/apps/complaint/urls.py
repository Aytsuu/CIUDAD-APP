from django.urls import path
from .views import *

urlpatterns = [
    
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('<int:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),

    # Archive
    path('<int:comp_id>/restore', RestoreComplaintView.as_view(), name='complaint-restore'),
    path('<int:pk>/archive/', ArchiveComplaintView.as_view(), name='archive-complaint'),
    path('archived/', ArchivedComplaintsView.as_view(), name='archived-complaints'),
    
    # Searching
    path('complainant/search/', SearchComplainantsView.as_view(), name='search-complainants'),
    path('accused/search/', SearchAccusedView.as_view(), name='search-accused'),

    # Sending the blotter to the ServiceChargeRequest
    path('<int:comp_id>/issue-raise/', ServiceChargeRequestCreateView.as_view(), name='complaint-issue-raise'),
]