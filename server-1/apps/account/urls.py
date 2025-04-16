from django.urls import path
from .views import *

urlpatterns = [
    path('signup/', SignUp.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    path('upload-image/', UserImageView.as_view(), name='user-image'),
]