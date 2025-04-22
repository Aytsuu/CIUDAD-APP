from django.urls import path
from .views import *
from .view.resident_profile_views import *
from .view.personal_views import *

urlpatterns = [
    
    # Personal Urls
    path("personal/", PersonalView.as_view(), name="personal-details-list"),
    path("personal/<int:per_id>/", PersonalUpdateView.as_view(), name="personal-update"),
    path("personal/create/", PersonalCreateView.as_view(), name="create_personal"),

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

    # Resident Urls
    path("resident/", ResidentProfileView.as_view(), name="resident-details"),
    path("resident/list/table/", ResidentProfileTableView.as_view(), name="residents-table"),
    path("resident/create/", ResidentProfileCreateView.as_view(), name="resident-create"),
    path("resident/create/combined/", ResidentPersonalCreateSerializer.as_view(), name="resident-combined-create"),

    # Request Urls
    path("request/", RequestRegistrationView.as_view(), name="request-details"),
    path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    path("request/file/", RequestFileView.as_view(), name="request-files"),

    # Business Urls
    path("business/", BusinessView.as_view(), name="business-details"),
    path("business/file/", BusinessFileView.as_view(), name="business-files"),

]