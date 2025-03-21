from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    #JWT authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
     # Admin
    path('admin/', admin.site.urls),
    
    path('api/', include('apps.useraccount.urls')),
    path("blotter/", include("apps.blotter.urls"))
]
