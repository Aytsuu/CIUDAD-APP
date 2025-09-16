from django.urls import path
# from .views import *
from .views.create_views import *
from .views.medrecord_table_views import *
from .views.confirmed_table_views import *
from .views.update_views import *
from .views.pending_table_views import *
from .views.count_views import *
from .views.register_patient_views import *

urlpatterns=[
        
        # TABLE VIEWS
        path('all-medicine-records/', PatientMedicineRecordsTableView.as_view(), name='all-medrecords'),
        path('medicine-records-table/<str:pat_id>/', MedicineRecordTableView.as_view(), name='medicine-records-table'),
        path('pending-medreq-items-table/<str:medreq_id>/', MedicineRequestPendingItemsTableView.as_view(), name='medicine_request-pending-details'),
        path('pending-medicine-request-table/', MedicineRequestPendingTableView.as_view(), name='medicine_request-pending'),
        path('confirmed-medicine-request-table/', MedicineRequestProcessingTableView.as_view(), name='medicine_request-processing'),

        
        # CREATE
        path('create-medicine-record/', CreateMedicineRecordView.as_view(), name='create-medrecord'),
        path('findings-plan-treatment/', CreateFindingPlanTreatmentView.as_view(), name='findings_plan_treatment'),
        path('create-medicine-allocation/', CreateMedicineRequestAllocationAPIView.as_view(), name='medicine-allocation'),
        path('childmedicine/', CreateChildServiceMedicineRecordView.as_view(), name='medicine_request_item_detail'),
        path('create-medicine/request/', CreateMedicineRequestView.as_view(), name='medicine-request-create'), 
        
        # UPDATE OR DELETE
        path('update-pending-medreq/<str:medreq_id>/',UpdateConfirmAllPendingItemsView.as_view(), name='update-all medicine-request-pending'),
        path('update-medreq-item/<int:medreqitem_id>/',UpdateMedicinerequestItemView.as_view(),name='update-medicine-request-items'),
        path('update-medicine-request/<str:medreq_id>/', UpdateMedicineRequestView.as_view(), name='medicine_request_detail'),

        
        # COUNT       
        path('medrec-count/<str:pat_id>/', GetMedRecordCountView.as_view(), name='medrec-count'),

        path('check-patient-exists/<str:rp_id>/', CheckPatientExistsAPIView.as_view(), name='check-patient-exists-get'),
        path('register-patient/', RegisterPatientAPIView.as_view(), name='register-patient'),

        
        
        # path('medicine-request/', MedicineRequestProcessingView.as_view(), name='medicine_request-processing'),
        # path('medrec-totalrecords/', MedicineTotalCountAPIView.as_view(), name='medrec-totalrecords'),
        # path('month-count/', MonthlyMedicineCountAPIView.as_view(), name='month-count'),
      
        # path('medicine-request-items/', MedicineRequestItemView.as_view(), name='medicine_request_items'),
        # path('medicine-request-pending/', MedicineRequestPendingTableView.as_view(), name='medicine_request-pending'),
        # path('medicine-request-items-pending/<str:medreq_id>/', MedicineRequestPendingItemsTableView.as_view(), name='medicine_request-pending-details'),

        # path('delete-medicine-request-item/int<medreqitem_id>/',MedicineRequestItemDelete.as_view(),name="delete-medicine-request-item"), 
        # path('childmedicine/', ChildServiceMedicineRecordView.as_view(), name='medicine_request_item_detail'),
        
        # path('medicine-records/monthly/', MonthlyMedicineSummariesAPIView.as_view(), name='monthly_medicine_records'),
        # path('medicine-reports/<str:month>/', MonthlyMedicineRecordsDetailAPIView.as_view(), name='medicine-reports'),
        # path('medicines-request/monthly/chart/<str:month>/',MonthlyMedicineChart.as_view(), name='medicines_list'),
        
        # path('update-medreq-item/<int:medreqitem_id>',UpdateMedicinerequestItemView.as_view(),name='update-medicine-request-items'),
        
        
        
        
        
        
        

   ]