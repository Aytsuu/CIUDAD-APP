from django.urls import path
from .views import *

urlpatterns = [
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('<int:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<int:comp_id>/restore', restore_complaint, name='complaint-restore'),
    path('<int:pk>/archive/', archive_complaint, name='archive-complaint'),
    path('archived/', archived_complaints, name='archived-complaints'),
    path('<int:comp_id>/issue-raise/', ServiceChargeRequestCreateView.as_view(), name='complaint-issue-raise'),
    path('complainant/search/', search_complainants, name='search-complainants'),
    path('accused/search/', search_accused, name='search-accused'),
]