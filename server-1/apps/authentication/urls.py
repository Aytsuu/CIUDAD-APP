from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    # path('logout/', LogOutView.as_view(), name='logout'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('mobile/signup/', sync_supabase_session, name='mobile_signup'),
    # path('users/<int:pk>/', UserAccountView.as_view(), name='user-detail'),
    # path('upload-image/', UploadImageView.as_view(), name='upload-image'),
    # path('verify/', VerifyAuthView.as_view(), name='verify'),
    # path('user/', CurrentUserView.as_view(), name='current-user'),
]