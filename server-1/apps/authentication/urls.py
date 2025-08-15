from django.urls import path, include
from django.conf import settings
from .views import *

urlpatterns = [
    path('web/login/', WebLoginView.as_view(), name='web-login'),
    path('mobile/login/', MobileLoginView.as_view(), name='mobile-login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('web/user/', WebUserView.as_view(), name='current-web-user'),
    path('mobile/user/', MobileUserView.as_view(), name='current-mobile-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshView.as_view(), name='refresh-session'),
    path('upload-image/', UploadImageView.as_view(), name='upload-image'),
    # path('mobile/verify-otp/', VerifyOTP.as_view(), name='verify-otp'),
    path('mobile/send-otp/', SendOTP.as_view(), name='send-otp'),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),    
    ]