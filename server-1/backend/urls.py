"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
    
URL configuration for {{ project_name }} project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/{{ docs_version }}/topics/http/urls/

Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', admin.site.urls),
    path('account/', include("apps.account.urls")),
    path('waste/', include('apps.waste.urls')),
    path('profiling/', include("apps.profiling.urls")),
    path('administration/', include("apps.administration.urls")),
    path('user/', include('apps.account.urls')),
    path('file/', include('apps.file.urls')),
    path('treasurer/', include('apps.treasurer.urls')),
    path('drr/', include('apps.drr.urls')),
    path('donation/', include('apps.donation.urls')),
    path('gad/', include('apps.gad.urls')),
    path('council/', include('apps.council.urls')),
]