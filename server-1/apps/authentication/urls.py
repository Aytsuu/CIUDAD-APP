from django.urls import path, include
from django.conf import settings
from .views.web_views import *
from .views.login_view import *
from .views.email_view import *
from .views.forgot_password_view import *
from .views.phone_view import *
from .views.logout_view import *

urlpatterns = [
    
    # Web authentication endpoints
    path('web/login/', ValidateOTPWebView.as_view(), name='web-login'),
    
    # Mobile authentication endpoints
    path('mobile/login/', ValidateOTPMobileView.as_view(), name='mobile-login'),
    
    # Mobile and Web shared endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
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