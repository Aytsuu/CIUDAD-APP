from django.urls import path
from .views import *

urlpatterns = [
    # path('service-charge-request/', ServiceChargeRequestView.as_view(), name='service-charge-request'),
    # path('case-details/<int:sr_id>/', ServiceChargeRequestDetailView.as_view(), name='case-details'),
    # path('case-activity/', CaseActivityView.as_view(), name='case-activity'),
    # path('update-service-charge-request/<int:sr_id>/', UpdateServiceChargeRequestView.as_view(), name='update-service-charge-request'),
    # path('file-action-request/', FileActionrequestView.as_view(), name='file-action-request'),
    # path('case-supp-doc/', CaseSuppDocView.as_view(), name='case-supp-doc'),
    # path('case-supp-doc/<int:ca_id>/', CaseSuppDocView.as_view(), name='case-supp-doc'),
    # path('delete-case-supp-doc/<int:csd_id>/', DeleteCaseSuppDocView.as_view(), name='delete-case-supp-doc'),
    # path('update-case-supp-doc/<int:csd_id>/', UpdateCaseSuppDocView.as_view(), name='update-case-supp-doc'),
    # path('service-charge-request-file/', ServiceChargeRequestFileView.as_view(), name='service-charge-request-file'),
    path('service-charge-pending-list/', SummonRequestPendingListView.as_view(), name='service=-charge-pending-list'),
    path('service-charge-rejected-list/', SummonRequestRejectedListView.as_view(), name='service=-charge-rejected-list'),
    path('update-summon-request/<str:sr_id>/', UpdateSummonRequestView.as_view(), name='update-summon-request'),
    path('service-charge-decision/', ServiceChargeDecisionView.as_view(), name='service-charge-decision'),
    path('service-charge-payment-request/', ServiceChargePaymentRequestView.as_view(), name='service-charge-payment-req'),
    path('summon-date-availability/', SummonDateAvailabilityView.as_view(), name='summon-dates'),
    path('delete-summon-date/<int:sd_id>/', DeleteSummonDateAvailability.as_view(), name='delete-summon-date'),
    path('summon-time-availability/', SummonTimeAvailabilityView.as_view(), name='summon-time-availability'),
    path('summon-time-availability/<int:sd_id>/', SummonTimeAvailabilityByDateView.as_view(), name='summon-time-availability-by-date'),
    path('delete-summon-time-availability/<int:st_id>/', DeleteSummonTimeAvailabilityView.as_view(), name='delete-summon-time-availability'),
   
    # Certificate URLs
    path('certificate/', CertificateListView.as_view(), name='certificate_list'),
    path('certificate-update-status/<str:cr_id>/', CertificateStatusUpdateView.as_view(), name='certificate_status_update'),
    path('certificate/<str:pk>/', CertificateDetailView.as_view(), name='certificate_detail'),
    path('certificate/<str:cr_id>/cancel/', CancelCertificateView.as_view(), name='certificate_cancel'),
    path('issued-certificates/', IssuedCertificateListView.as_view(), name='issued-certificate-list'),
    path('mark-certificate-issued/', MarkCertificateAsIssuedView.as_view(), name='mark-certificate-issued'),
    path('business-permit/', BusinessPermitListView.as_view(), name='business-permit-list'),
    path('issued-business-permits/', IssuedBusinessPermitListView.as_view(), name='issued-business-permit-list'),
    path('mark-business-permit-issued/', MarkBusinessPermitAsIssuedView.as_view(), name='mark-business-permit-issued'),
    
    # Personal Clearances and Payment URLs
    path('personal-clearances/', PersonalClearancesView.as_view(), name='personal-clearances-list'),
    path('nonresident-personal-clearance/', NonResidentsCertReqView.as_view(), name='nonresident-personal-cert-req'),
    path('update-personal-req-status/<int:nrc_id>/', UpdateNonResidentCertReqView.as_view(), name='update-non-resident-status'),
    path('permit-clearances/', PermitClearanceView.as_view(), name='permit-clearances-list'),
    path('payment/create/<str:cr_id>/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('payment/webhook/', PaymentStatusView.as_view(), name='payment-webhook'),

    # Business Clearance endpoints
    path('business-clearance/', ClearanceRequestView.as_view(), name='business-clearance-create'),

    # Treasurer - Service Charge Requests
    path('treasurer/service-charges/', ServiceChargeTreasurerListView.as_view(), name='treasurer-service-charges'),
]