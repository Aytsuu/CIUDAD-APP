from django.urls import path
from .views import *

urlpatterns = [
  path("retrieve/<int:lp_id>/", LandingPageView.as_view(), name="retrieve-landing-data"),
  path("update/<int:lp_id>/", LandingPageUpdateView.as_view(), name="update-landing-page")
]