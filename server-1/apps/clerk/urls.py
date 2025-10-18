from django.urls import path
from .views import *
from .summon.summonViews import *
from apps.complaint.view import ComplaintDetailView

urlpatterns = [ 
    # Council Mediation
    path('council-case-list/', CouncilMediationCasesView.as_view(), name='council-case-list'),
    path('council-case-detail/<str:sc_id>/', CouncilCaseDetailView.as_view(), name='council-case-detail'),

    # Case List and details
    path('summon-case-list/', SummonCasesView.as_view(), name='summon-case-list'),
    path('summon-case-detail/<str:sc_id>/', SummonCaseDetailView.as_view(), name='summon-case-detail'),
    path('update-summon-case/<str:sc_id>/', UpdateSummonCaseView.as_view(), name='update-summon-case'),
    path('summon-schedule-list/<str:sc_id>/', HearingScheduleListView.as_view(), name='summon-schedule-list'),
    path('view-complaint/<str:comp_id>/', ComplaintDetailView.as_view(), name='complaint-detail'),

    path('hearing-minutes/', HearingMinutesCreateView.as_view(), name='hearing-minutes-create'),
    path('hearing-schedule/', HearingScheduleView.as_view(), name='hearing-sched-create'),
    path('update-hearing-schedule/<str:hs_id>/', UpdateHearingScheduleView.as_view(), name='hearing-sched-update'),
    path('remark/', RemarkView.as_view(), name='remark-create'),
    path('remark-supp-docs/', RemarkSuppDocCreateView.as_view(), name='remark-supp-doc-create'),
    
    # Lupon
    path('lupon-case-list/', LuponCasesView.as_view(), name='lupon-case-list'),
    path('lupon-case-detail/<str:sc_id>/', LuponCaseDetailView.as_view(), name='lupon-case-detail'),

    # Summon date and time
    path('summon-date-availability/', SummonDateAvailabilityView.as_view(), name='summon-dates'),
    path('delete-summon-date/<int:sd_id>/', DeleteSummonDateAvailability.as_view(), name='delete-summon-date'),
    path('summon-time-availability/', SummonTimeAvailabilityView.as_view(), name='summon-time-availability'),
    path('summon-time-availability/<int:sd_id>/', SummonTimeAvailabilityByDateView.as_view(), name='summon-time-availability-by-date'),
    path('delete-summon-time-availability/<int:st_id>/', DeleteSummonTimeAvailabilityView.as_view(), name='delete-summon-time-availability'),
    path('update-summon-time-availability/<str:st_id>/', UpdateSummonTimeAvailabilityView.as_view(), name='update-summon-time-availability'),

    # Payment req
    path('service-charge-payment-req/', ServiceChargePaymentReqView.as_view(), name='service-charge-payment-req'),
    path('file-action-id/', FileActionIdView.as_view(), name='file-action-id'),

    path('service-charge-decision/', ServiceChargeDecisionView.as_view(), name='service-charge-decision'),
    path('case-tracking/<str:comp_id>/', CaseTrackingView.as_view(), name='case-tracking'),
   
    # Certificate URLs
    path('certificate/', CertificateListView.as_view(), name='certificate_list'),
    path('certificate-update-status/<str:cr_id>/', CertificateStatusUpdateView.as_view(), name='certificate_status_update'),
    path('certificate/<str:pk>/', CertificateDetailView.as_view(), name='certificate_detail'),
    path('certificate/<str:cr_id>/cancel/', CancelCertificateView.as_view(), name='certificate_cancel'),
    path('issued-certificates/', IssuedCertificateListView.as_view(), name='issued-certificate-list'),
    path('mark-certificate-issued/', MarkCertificateAsIssuedView.as_view(), name='mark-certificate-issued'),
    path('business-permit/upload/', BusinessPermitUploadView.as_view(), name='business-permit-upload'),
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
    path('treasurer/service-charge-payment/<int:pay_id>/', UpdateServiceChargePaymentStatusView.as_view(), name='update-service-charge-payment'),
    
    # Business Permit Files
    path('business-permit-files/<str:bpr_id>/', BusinessPermitFilesView.as_view(), name='business-permit-files'),
    
    # Certificate Analytics
    path('analytics/certificates/', CertificateAnalyticsView.as_view(), name='certificate-analytics'),
    path('analytics/certificates/purpose-trending/', CertificatePurposeTrendingView.as_view(), name='certificate-purpose-trending'),
    
    # Business Permit Analytics
    path('analytics/business-permits/', BusinessPermitAnalyticsView.as_view(), name='business-permit-analytics'),
    path('analytics/business-permits/sidebar/', BusinessPermitSidebarView.as_view(), name='business-permit-sidebar'),
]