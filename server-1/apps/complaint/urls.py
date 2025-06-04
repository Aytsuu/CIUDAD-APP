from django.urls import path
from .views import *

urlpatterns = [
    path('complaints/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('complaints/list/', ComplaintListView.as_view(), name='complaint-list'),
    path('complaints/<int:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),
]