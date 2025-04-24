from django.urls import path
from .views import *
from .view.resident_profile_views import *
from .view.personal_views import *
from .view.family_views import *
from .view.family_composition_views import * 
from .view.household_views import *
from .view.sitio_views import *

urlpatterns = [
    
    # Personal Urls
    path("personal/", PersonalView.as_view(), name="personal-details-list"),
    path("personal/<int:per_id>/", PersonalUpdateView.as_view(), name="personal-update"),
    path("personal/create/", PersonalCreateView.as_view(), name="create_personal"),

    # Family Urls
    path("family/", FamilyView.as_view(), name="family-details"),
    path("family/update/<str:fam_id>/", FamilyUpdateView.as_view(), name="update-family-details"),
    path("family/list/table/", FamilyTableView.as_view(), name="family-table"),
    path("family/list/filter/<str:hh>/", FamilyFilteredByHouseholdView.as_view(), name="filter-family-list"),
    path("family/<str:fam_id>/data/", FamilyDataView.as_view(), name="family-data"),
    path("family/<str:fam_id>/members/", FamilyMembersListView.as_view(), name="family-members-list"),
    path("family/create/", FamilyCreateView.as_view(), name="family-create"),


    # Family Composition Urls
    path("family-composition/", FamilyCompositionView.as_view(), name="family-composition-details"),
    path("family/composition/delete/<str:fam>/<str:rp>/", FamilyCompositionDeleteView.as_view(), name="family-composition-delete"),
    path("family/composition/create/", FamilyCompositionCreateView.as_view(), name="create-family-member"),
    path("family/composition/bulk/create/", FamilyCompositionBulkCreateView.as_view(), name="family-composition-bulk-create"),

    # Sitio Urls
    path("sitio/list/", SitioListView.as_view(), name="sitio-list"),

    # Househould Urls
    path("household/", HouseholdView.as_view(), name="household-details"),
    path("household/list/", HouseholdListView.as_view(), name="household-list"),
    path("household/list/table/", HouseholdTableView.as_view(), name="household-table"),
    path("household/<str:hh_id>/data/", HouseholdListView.as_view(), name="household-details"),
    path("household/create/", HouseholdCreateView.as_view(), name="create-household"),

    # Resident Urls
    path("resident/", ResidentProfileListView.as_view(), name="resident-details"),
    path("resident/list/table/", ResidentProfileTableView.as_view(), name="residents-table"),
    path("resident/create/", ResidentProfileCreateView.as_view(), name="resident-create"),
    path("resident/create/combined/", ResidentPersonalCreateView.as_view(), name="resident-combined-create"),
    path("resident/personal/<str:rp_id>/", ResidentPersonalInfoView.as_view(), name="resident-personal-info"),
    path("resident/exclude/fam/<str:fam_id>/", ResidentProfileListView.as_view(), name="resident-list-with exclusions"),

    # Request Urls
    path("request/", RequestRegistrationView.as_view(), name="request-details"),
    path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    path("request/file/", RequestFileView.as_view(), name="request-files"),

    # Business Urls
    path("business/", BusinessView.as_view(), name="business-details"),
    path("business/file/", BusinessFileView.as_view(), name="business-files"),

]