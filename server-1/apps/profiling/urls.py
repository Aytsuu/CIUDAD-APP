from django.urls import path
from .views.resident_profile_views import *
from .views.personal_views import *
from .views.family_views import *
from .views.family_composition_views import * 
from .views.household_views import *
from .views.sitio_views import *
from .views.address_views import *
from .views.request_registration_views import *
from .views.business_views import *
from .views.analytics_views import *
from .views.kyc_views import *
from .views.all_record_views import *
from .views.voter_views import *

urlpatterns = [
    # All record (combined record of resident and business respondents)
    path("all/", AllRecordTableView.as_view(), name="all-record"),
    path("complete/registration/", CompleteRegistrationView.as_view(), name="complete-registration"),

    #Voter Urls
    path("voter/list/table/", VoterTableView.as_view(), name="voter-list"),

    # Sitio Urls
    path("sitio/list/", SitioListView.as_view(), name="sitio-list"),
    path("sitio/create/", SitioCreateView.as_view(), name="sitio-create"),
    path("sitio/<str:sitio_id>/delete/", SitioDeleteView.as_view(), name="sitio-delete"),

    # Address Urls
    path("address/create/", AddressBulkCreateView.as_view(), name="create-address"),
    path("per_address/create/", PerAddressBulkCreateView.as_view(), name="create-per-address"),
    path("per_address/list/", PerAddressListView.as_view(), name="per-address-list"),

    # Personal Urls
    path("personal/update/<int:pk>/", PersonalUpdateView.as_view(), name="personal-update"),
    path("personal/create/", PersonalCreateView.as_view(), name="create-personal"),
    path("personal/create-modification/", PersonalModificationCreateView.as_view(), name="personal-create-modification"),
    path("personal/<int:per>/modification/", PersonalModificationRequestsView.as_view(), name="personal-modification-request"),
    path("personal/history/", PersonalHistoryView.as_view(), name="personal-history"),

    # Family Urls
    path("family/update/<str:fam_id>/", FamilyUpdateView.as_view(), name="update-family-details"),
    path("family/list/table/", FamilyTableView.as_view(), name="family-table"),
    path("family/list/filter/<str:hh>/", FamilyFilteredByHouseholdView.as_view(), name="filter-family-list"),
    path("family/<str:fam_id>/data/", FamilyDataView.as_view(), name="family-data"),
    path("family/<str:fam_id>/members/", FamilyMembersListView.as_view(), name="family-members-list"),
    path("family/create/", FamilyCreateView.as_view(), name="family-create"),
    path("family/id/<str:rp>/", FamilyIDView.as_view(), name="retrieve-family-id"),
    path("family/composition/delete/<str:fam>/<str:rp>/", FamilyMemberDeleteView.as_view(), name="member-deletion"),
    path("family/role/update/<str:fam>/<str:rp>/", FamilyRoleUpdateView.as_view(), name="family-composition-update"),
    path("family/composition/create/", FamilyCompositionCreateView.as_view(), name="create-family-member"),
    path("family/composition/bulk/create/", FamilyCompositionBulkCreateView.as_view(), name="family-composition-bulk-create"),
    path("family/verify/account-create/", VerifyFamily.as_view(), name="join-existing-family"),

    # Househould Urls
    path("household/list/", HouseholdListView.as_view(), name="household-list"),
    path("household/list/table/", HouseholdTableView.as_view(), name="household-table"),
    path("household/<str:hh_id>/data/", HouseholdDataView.as_view(), name="household-details"),
    path("household/create/", HouseholdCreateView.as_view(), name="create-household"),
    path("household/update/<str:hh_id>/", HouseholdUpdateView.as_view(), name="upadate-household"),

    # Resident Urls
    path("resident/", ResidentProfileListWithOptions.as_view(), name="resident-details"),
    path("resident/list/table/", ResidentProfileTableView.as_view(), name="residents-table"),
    path("resident/create/combined/", ResidentPersonalCreateView.as_view(), name="resident-combined-create"),
    path("resident/personal/<str:rp_id>/", ResidentPersonalInfoView.as_view(), name="resident-personal-info"),
    path("resident/exclude/fam/<str:fam_id>/", ResidentProfileListWithOptions.as_view(), name="resident-list-with exclusions"),
    path("resident/fam/<str:fam>/list/", ResidentProfileFamSpecificListView.as_view(), name="resident-list-fam"),
    path("resident/<str:rp_id>/link-to-voter/", LinkVoterView.as_view(), name="link-to-voter"),

    # Request Urls
    path("request/list/table/", RequestTableView.as_view(), name="request-list-table"),
    path("request/create/", RequestCreateView.as_view(), name="request-create"),
    path("request/link/registration/", LinkRegVerificationView.as_view(), name="link-registration-verification"),
    path("request/delete/<int:req_id>/", RequestDeleteView.as_view(), name="request-deletion"),
    path("request/count/", RequestCountView.as_view(), name="total-request"),

    # Business Urls
    path("business/active/list/table/", ActiveBusinessTableView.as_view(), name="business-active-list"),
    path("business/pending/list/table/", PendingBusinessTableView.as_view(), name="business-pending-list"),
    path("business/respondent/list/table/", BusinessRespondentTableView.as_view(), name="business-respondent-list"),
    path("business/create/", BusinessCreateView.as_view(), name="business-create"),
    path("business/respondent/create/", BRCreateUpdateView.as_view(), name="create-business-respondent"),
    path("business/<str:bus_id>/info/", BusinessInfoView.as_view(), name="business-data"),
    path("business/respondent/<str:br_id>/info/", BusinessRespondentInfoView.as_view(), name="business-respondent-data"),
    path("business/<str:bus_id>/update/", BusinessUpdateView.as_view(), name="business-update"),
    path("business/specific/ownership/", SpecificOwnerView.as_view(), name="business-for-specific-owner"),
    path("business/file/create/", BusinessFileCreateView.as_view(), name="business-file-create"),
    path("business/verify/account-creation/", VerifyBusinessRespondent.as_view(), name="respondent-account-creation"),
    path("business/modification/create/", BusinessModificationCreateView.as_view(), name='modify-business'),
    path("business/modification/delete/", BusinessModificationDeleteView.as_view(), name='modification-request-result'),
    path("business/modification/<int:bm_id>/result/", BusinessModificationUpdateView.as_view(), name='update-modification'),
    path("business/modification/request-list/", BusinessModificationListView.as_view(), name="request-list"),
    path("business/history/", BusinessHistoryView.as_view(), name="business-history"),
    
    # Analytics Urls,
    path("card/analytics/data/", CardAnalyticsView.as_view(), name='card-analytics'),
    path("sidebar/analytics/data/", SidebarAnalyticsView.as_view(), name="sidebar-analytics"),
    
    # KYC
    path("kyc/match-document/", KYCDocumentMatchingView.as_view(), name="document-matching"),
    path("kyc/match-face/", KYCFaceMatchingView.as_view(), name="face-matching"),
]