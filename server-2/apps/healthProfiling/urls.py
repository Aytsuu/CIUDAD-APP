from django.urls import path
from .views import *
from .views.resident_profile_views import *
from .views.personal_views import *
from .views.family_views import *
from .views.family_composition_views import * 
from .views.household_views import *
from .views.sitio_views import *
from .views.address_views import *
# from .views_deprecated import * # To be removed

urlpatterns = [
    # Sitio Urls
    path("sitio/list/", SitioListView.as_view(), name="sitio-list"),

    # Address Urls
    path("address/create/", AddressBulkCreateView.as_view(), name="create-address"),
    path("per_address/create/", PerAddressBulkCreateView.as_view(), name="create-per-address"),
    path("per_address/list/", PerAddressListView.as_view(), name="per-address-list"),
    
    # Personal Urls 
    # path("personal/", PersonalView.as_view(), name="personal-details-list"),
    path("personal/update/<int:per_id>/", PersonalUpdateView.as_view(), name="personal-update"),
    path("personal/create/", PersonalCreateView.as_view(), name="create-personal"),

    # Family Urls
    # path("family/", FamilyView.as_view(), name="family-details"),
    path("family/update/<str:fam_id>/", FamilyUpdateView.as_view(), name="update-family-details"),
    path("family/list/table/", FamilyTableView.as_view(), name="family-table"),
    path("family/list/filter/<str:hh>/", FamilyFilteredByHouseholdView.as_view(), name="filter-family-list"),
    path("family/<str:fam_id>/data/", FamilyDataView.as_view(), name="family-data"),
    path("family/<str:fam_id>/members/", FamilyMembersListView.as_view(), name="family-members-list"),
    path("family/create/", FamilyCreateView.as_view(), name="family-create"),
    path("family/id/<str:rp>/", FamilyIDView.as_view(), name="retrieve-family-id"),
    # path("family-composition/", FamilyCompositionView.as_view(), name="family-composition-details"),
    # path("family/composition/delete/<str:fam>/<str:rp>/", FamilyCompositionDeleteView.as_view(), name="family-composition-delete"),
    path("family/role/update/<str:fam>/<str:rp>/", FamilyRoleUpdateView.as_view(), name="family-composition-update"),
    path("family/composition/create/", FamilyCompositionCreateView.as_view(), name="create-family-member"),
    path("family/composition/bulk/create/", FamilyCompositionBulkCreateView.as_view(), name="family-composition-bulk-create"),

    # Househould Urls
    # path("household/", HouseholdView.as_view(), name="household-details"),
    path("household/list/", HouseholdListView.as_view(), name="household-list"),
    path("household/list/table/", HouseholdTableView.as_view(), name="household-table"),
    path("household/<str:hh_id>/data/", HouseholdListView.as_view(), name="household-details"),
    path("household/create/", HouseholdCreateView.as_view(), name="create-household"),
    path("household/update/<str:hh_id>/", HouseholdUpdateView.as_view(), name="upadate-household"),

    # Resident Urls
    path("resident/", ResidentProfileListExcludeFamView.as_view(), name="resident-details"),
    path("resident/list/table/", ResidentProfileTableView.as_view(), name="residents-table"),
    path("resident/create/", ResidentProfileCreateView.as_view(), name="resident-create"),
    path("resident/create/combined/", ResidentPersonalCreateView.as_view(), name="resident-combined-create"),
    path("resident/personal/<str:rp_id>/", ResidentPersonalInfoView.as_view(), name="resident-personal-info"),
    path("resident/exclude/fam/<str:fam_id>/", ResidentProfileListExcludeFamView.as_view(), name="resident-list-with exclusions"),
    path("resident/fam/<str:fam>/list/", ResidentProfileFamSpecificListView.as_view(), name="resident-list-fam"),

    # Request Urls
    # path("request/", RequestRegistrationView.as_view(), name="request-details"),
    # path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    # path("request/file/", RequestFileView.as_view(), name="request-files"),

    # # Business Urls
    # path("business/", BusinessView.as_view(), name="business-details"),
    # path("business/file/", BusinessFileView.as_view(), name="business-files"),

]

