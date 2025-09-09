from django.urls import path
from .views import *

urlpatterns=[
        path('all-medicine-records/', PatientMedicineRecordsView.as_view(), name='all-medrecords'),
        path('indiv-medicine-record/<str:pat_id>/', IndividualMedicineRecordView.as_view(), name='inv-medrecord'),
        path('medicine-records-table/<str:pat_id>/', MedicineRecordTableView.as_view(), name='medicine-records-table'),

        path('create-medicine-record/', CreateMedicineRecordView.as_view(), name='create-medrecord'),

        path('medrec-totalrecords/', MedicineTotalCountAPIView.as_view(), name='medrec-totalrecords'),
        path('medrec-count/<str:pat_id>/', GetMedRecordCountView.as_view(), name='medrec-count'),
        path('month-count/', MonthlyMedicineCountAPIView.as_view(), name='month-count'),
      
        path('medicine-request-items/', MedicineRequestItemView.as_view(), name='medicine_request_items'),
        # path('medicine-request/', MedicineRequestProcessingView.as_view(), name='medicine_request-processing'),
        # path('medicine-request-pending/', MedicineRequestPendingTableView.as_view(), name='medicine_request-pending'),
        # path('medicine-request-items-pending/<str:medreq_id>/', MedicineRequestPendingItemsTableView.as_view(), name='medicine_request-pending-details'),

        path('medicine-request/<int:medreq_id>/', DeleteUpdateMedicineRequestView.as_view(), name='medicine_request_detail'),
        path('delete-medicine-request-item/int<medreqitem_id>/',MedicineRequestItemDelete.as_view(),name="delete-medicine-request-item"), 
        # path('childmedicine/', ChildServiceMedicineRecordView.as_view(), name='medicine_request_item_detail'),
        path('findings-plan-treatment/', FindingPlanTreatmentView.as_view(), name='findings_plan_treatment'),
        
        path('medicine-records/monthly/', MonthlyMedicineSummariesAPIView.as_view(), name='monthly_medicine_records'),
        path('medicine-reports/<str:month>/', MonthlyMedicineRecordsDetailAPIView.as_view(), name='medicine-reports'),
        path('medicines-request/monthly/chart/<str:month>/',MonthlyMedicineChart.as_view(), name='medicines_list'),
        
        # path('update-medreq-item/<int:medreqitem_id>',UpdateMedicinerequestItemView.as_view(),name='update-medicine-request-items'),
        
        #REVISE (BACKEND)
        path('create-medicine/request/', MedicineRequestCreateView.as_view(), name='medicine-request-create'), 
        
        
        
        
        
        

   ]