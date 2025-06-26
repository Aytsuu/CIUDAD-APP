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
