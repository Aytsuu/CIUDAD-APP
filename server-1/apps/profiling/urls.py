from django.urls import path
from .views import *

urlpatterns = [
    
    # Personal Urls
    path("personal/", PersonalView.as_view(), name="personal-details-list"),
    path("personal/<int:per_id>/", PersonalUpdateView.as_view(), name="personal-update"),

    # Family Urls
    path("family/", FamilyView.as_view(), name="family-details"),
    path("family/update/<str:fam_id>/", FamilyUpdateView.as_view(), name="update-family-details"),

    # Family Composition Urls
    path("family-composition/", FamilyCompositionView.as_view(), name="family-composition-details"),
    path("family-composition/delete/<str:fam>/<str:rp>/", FamilyCompositionDeleteView.as_view(), name="family-composition-delete"),

    # Sitio Urls
    path("sitio/", SitioView.as_view(), name="sitio-list"),

    # Househould Urls
    path("household/", HouseholdView.as_view(), name="household-details"),

    # Registered Urls
    path("resident/", ResidentProfileView.as_view(), name="resident-details"),

    # Request Urls
    path("request/", RequestRegistrationView.as_view(), name="request-details"),
    path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    path("request/file/", RequestFileView.as_view(), name="request-files"),

    # Business Urls
    path("business/", BusinessView.as_view(), name="business-details"),
    path("business/file/", BusinessFileView.as_view(), name="business-files"),

]