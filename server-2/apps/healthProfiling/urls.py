from django.urls import path
from .views import *
from .views.resident_profile_views import *
from .views.personal_views import *
from .views.family_views import *
from .views.family_composition_views import * 
from .views.household_views import *
from .views.sitio_views import *
from .views.address_views import *
from .views.request_registration_views import *
from .views.environmental_views import *
from .views.environmental_form_views import *
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
    path("personal/update/<int:pk>/", PersonalUpdateView.as_view(), name="personal-update"),
    path("personal/create/", PersonalCreateView.as_view(), name="create-personal"),
    path("personal/history/", PersonalHistoryView.as_view(), name="personal-history"),

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
    path("resident/", ResidentProfileListWithOptions.as_view(), name="resident-details"),
    path("resident/list/table/", ResidentProfileTableView.as_view(), name="residents-table"),
    path("resident/create/", ResidentProfileCreateView.as_view(), name="resident-create"),
    path("resident/create/combined/", ResidentPersonalCreateView.as_view(), name="resident-combined-create"),
    path("resident/personal/<str:rp_id>/", ResidentPersonalInfoView.as_view(), name="resident-personal-info"),
    path("resident/exclude/fam/<str:fam_id>/", ResidentProfileListWithOptions.as_view(), name="resident-list-with exclusions"),
    path("resident/fam/<str:fam>/list/", ResidentProfileFamSpecificListView.as_view(), name="resident-list-fam"),

    path('respondents/create/', RespondentsInfoCreateView.as_view(), name='respondents-create'),
    path('per_additional_details/create/', HealthRelatedDetailsCreateView.as_view(), name='health-details-create'),
    path('mother-health-info/', MotherHealthInfoListView.as_view(), name='mother-health-info-list'),
    path('mother-health-info/<int:pk>/', MotherHealthInfoView.as_view(), name='mother-health-info-detail'),

    #   # Request Urls
    # path("request/list/table/", RequestTableView.as_view(), name="request-list-table"),
    # # path("request/create/", RequestCreateView.as_view(), name="request-create"),
    # path("request/link/registration/", LinkRegVerificationView.as_view(), name="link-registration-verification"),
    # path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    # path("request/count/", RequestCountView.as_view(), name="total-request"),


    # Request Urls
    # path("request/", RequestRegistrationView.as_view(), name="request-details"),
    # path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    # path("request/file/", RequestFileView.as_view(), name="request-files"),

    # # Business Urls
    # path("business/", BusinessView.as_view(), name="business-details"),
    # path("business/file/", BusinessFileView.as_view(), name="business-files"),

    # Environmental/Water Supply URLs
    path("water-supply/list/", WaterSupplyListView.as_view(), name="water-supply-list"),
    path("water-supply/types/", WaterSupplyTypesView.as_view(), name="water-supply-types"),
    path("water-supply/options/", WaterSupplyOptionsView.as_view(), name="water-supply-options"),
    path("water-supply/create/", WaterSupplyCreateView.as_view(), name="water-supply-create"),
    path("water-supply/household/<str:hh_id>/", WaterSupplyByHouseholdView.as_view(), name="water-supply-by-household"),
    
    path("sanitary-facility/list/", SanitaryFacilityListView.as_view(), name="sanitary-facility-list"),
    path("sanitary-facility/create/", SanitaryFacilityCreateView.as_view(), name="sanitary-facility-create"),
    path("sanitary-facility/household/<str:hh_id>/", SanitaryFacilityByHouseholdView.as_view(), name="sanitary-facility-by-household"),
    
    path("environmental-data/<str:hh_id>/", EnvironmentalDataView.as_view(), name="environmental-data"),
    path("environmental-data/create/", EnvironmentalDataCreateView.as_view(), name="environmental-data-create"),
    path("environmental-form/submit/", EnvironmentalFormSubmitView.as_view(), name="environmental-form-submit"),

]

