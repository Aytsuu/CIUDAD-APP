from django.urls import path
from .views import CertificateListView, CertificateDetailView, BusinessPermitListView, BusinessPermitView, DocumentPDFListView

urlpatterns = [
    #certificate urls
    path('certificate/', CertificateListView.as_view(), name='certificate_list_create'),  
    path('certificate/<int:cert_req_no>/', CertificateDetailView.as_view(), name='certificate-detail'),

    #business permit urls
    path('businesspermit/', BusinessPermitListView.as_view(), name='business_permit_list_create'),
    # path('businesspermit/<int:busi_req_no>/', BusinessPermitView  .as_view(), name='certificate-detail'),

    path('template/', DocumentPDFListView.as_view(), name='document_create'),
]
from django.urls import path
from .views import *

urlpatterns = [
    path('service-charge-request/', ServiceChargeRequestView.as_view(), name='service-charge-request'),
    path('case-details/<int:sr_id>/', ServiceChargeRequestDetailView.as_view(), name='case-details'),
    path('case-activity/', CaseActivityView.as_view(), name='case-activity'),
    path('update-service-charge-request/<int:sr_id>/', UpdateServiceChargeRequestView.as_view(), name='update-service-charge-request'),
    path('file-action-request/', FileActionrequestView.as_view(), name='file-action-request'),
]
