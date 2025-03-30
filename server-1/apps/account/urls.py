from django.urls import path
from .views import UserSignupView, UserLoginView, UserAccountView

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    # path('upload/', upload_image, name='user-image'),
]