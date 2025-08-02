from django.urls import path
from .views import *

urlpatterns=[
        path('all-medicine-records/', PatientMedicineRecordsView.as_view(), name='all-medrecords'),
        path('indiv-medicine-record/<str:pat_id>/', IndividualMedicineRecordView.as_view(), name='inv-medrecord'),
        path('create-medicine-record/', CreateMedicineRecordView.as_view(), name='create-medrecord'),
        path('medrec-count/<str:pat_id>/', GetMedRecordCountView.as_view(), name='medrec-count'),
        path('medicine-records/monthly/', MonthlyFirstAidRecordsAPIView.as_view(), name='monthly_medicine_records'),
        path('medicine-request-items/', MedicineRequestItemView.as_view(), name='medicine_request_items'),
        path('medicine-request/', MedicineRequestView.as_view(), name='medicine_request'),
      
      
        path('medicine-request/<int:medreq_id>/', DeleteUpdateMedicineRequestView.as_view(), name='medicine_request_detail'),
        path('delete-medicine-request-item/int<medreqitem_id>/',MedicineRequestItemDelete.as_view(),name="delete-medicine-request-item"),
        path('childmedicine/', ChildServiceMedicineRecordView.as_view(), name='medicine_request_item_detail'),
        path('findings-plan-treatment/', FindingPlanTreatmentView.as_view(), name='findings_plan_treatment'),

   ]