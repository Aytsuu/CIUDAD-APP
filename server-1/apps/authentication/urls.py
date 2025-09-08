from django.urls import path, include
from django.conf import settings
from .views.web_views import *

urlpatterns = [
    
    # Web authentication endpoints
    path('web/login/', WebLoginView.as_view(), name='web-login'),
    
    # Mobile authentication endpoints
    path('mobile/login/', MobileLoginView.as_view(), name='mobile-login'),
    
    # Mobile and Web shared endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # OTP endpoints
    path('send-otp/', SendOTP.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTP.as_view(), name='verify-otp'),
    path('email/sendOtp/', SendOTPEmail.as_view(), name='email-send-otp'),
    path('email/verifyOtp/', VerifyOTPEmail.as_view(), name='email-verify-otp'),
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),    
    ]