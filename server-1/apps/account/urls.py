from django.urls import path
<<<<<<< HEAD
from .views import SignInView, LoginView, UserAccountView, UserProfileView, ChangePassword
=======
from .views import *
>>>>>>> blotter2.0

urlpatterns = [
    path('signup/', SignUp.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
<<<<<<< HEAD
    path('upload-image/', UserProfileView.as_view(), name='user-image'),
    path('change-password/', ChangePassword.as_view(), name='change-image'),
=======
    path('upload-image/', UserImageView.as_view(), name='user-image'),
>>>>>>> blotter2.0
]