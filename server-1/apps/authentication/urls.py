from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('user/', UserView.as_view(), name='current-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshView.as_view(), name='refresh-session'),
    path('upload-image/', UploadImageView.as_view(), name='upload-image'),
    
    path('forgot-password/send-code/', SendResetCodeView.as_view(), name='send-reset-code'),
    path('forgot-password/verify-code/', VerifyResetCodeView.as_view(), name='verify-reset-code'),
    path('forgot-password/reset/', ResetPasswordView.as_view(), name='reset-password'),
    path('forgot-password/resend-code/', ResendResetCodeView.as_view(), name='resend-reset-code'),
]