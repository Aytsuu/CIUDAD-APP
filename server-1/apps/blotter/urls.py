from django.urls import path
from .views import *

urlpatterns = [
    path('create/', BlotterCreateView.as_view(), name='blotter-create'),
    path('list/', BlotterListView.as_view(), name='blotter-list'),
    path('<int:id>/', BlotterDetailView.as_view(), name='blotter-detail'),
]