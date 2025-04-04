from django.urls import path
from .views import SignInView, LoginView, UserAccountView, UserProfileView, ChangePassword

urlpatterns = [
    path('signup/', SignInView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    path('upload-image/', UserProfileView.as_view(), name='user-image'),
    path('change-password/', ChangePassword.as_view(), name='change-image'),
]