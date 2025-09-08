from django.urls import path
from .views import *

urlpatterns = [
    path('', UserAccountListView.as_view(), name='user-list'),
    path('<int:pk>/', UserAccountDetailView.as_view(), name='user-detail'),
    path('email/list/', ListOfExistingEmail.as_view(), name='email-list'),
    path('upload-image/', UploadImageView.as_view(), name='upload-image'),
]