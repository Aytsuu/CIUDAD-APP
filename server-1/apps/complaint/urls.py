from django.urls import path
from .views import *

urlpatterns = [
    path('create/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('list/', ComplaintListView.as_view(), name='complaint-list'),
    path('<int:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('<int:pk>/archive/', archive_complaint, name='archive-complaint'),
    path('archived/', archived_complaints, name='archived-complaints'),
]