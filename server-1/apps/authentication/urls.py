from django.urls import path, include
from django.conf import settings
from .views.registration import *
from .views.email import *
from .views.forgot_password import *
from .views.logout import *

urlpatterns = [
    # authentication endpoints
    path('web/login/', ValidateOTPWebView.as_view(), name='web-login'),
    path('mobile/login/', ValidateOTPMobileView.as_view(), name='mobile-login'),
    
    # Mobile and Web shared endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    # OTP endpoints
    path('email/sendOtp/', emailOTPView.as_view(), name='email-send-otp'),
    # path('verify/web-registration/', VerifyWebAccRegistration.as_view(), name="verify-credential")
    path("signup/otp-verification/", VerifySignup.as_view(), name="signup-verification")
]


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),    
    ]