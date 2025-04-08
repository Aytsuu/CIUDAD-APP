from django.urls import path
from .views import SignInView, LoginView, UserAccountView, UserProfileView

urlpatterns = [
    path('signup/', SignInView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    path('upload-image/', UserProfileView.as_view(), name='user-image'),
]
