from django.urls import path
from .views import *

urlpatterns = [
    path('complaint/', ComplaintCreateView.as_view(), name='complaint-create'),
    path('complaint/list/', ComplaintListView.as_view(), name='complaint-list'),
    path('complaint/<int:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),
]