from django.urls import path
# from .views import *
from .views.create_views import *
from .views.medrecord_table_views import *
from .views.confirmed_table_views import *
from .views.update_views import *
from .views.pending_table_views import *
from .views.count_views import *
from .views.register_patient_views import *
from .views.medrequest_views import *


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
        path('update-pending-medreq/',UpdateConfirmAllPendingItemsView.as_view(), name='update-all medicine-request-pending'),
        path('update-medreq-item/<int:medreqitem_id>/',UpdateMedicinerequestItemView.as_view(),name='update-medicine-request-items'),
        path('update-medicine-request/<str:medreq_id>/', UpdateMedicineRequestView.as_view(), name='medicine_request_detail'),

        
        # COUNT       
        path('medrec-count/<str:pat_id>/', GetMedRecordCountView.as_view(), name='medrec-count'),

        path('check-patient-exists/<str:rp_id>/', CheckPatientExistsAPIView.as_view(), name='check-patient-exists-get'),
        path('register-patient/', RegisterPatientAPIView.as_view(), name='register-patient'),

        
        # Kurt urls and views
        path('indiv-medicine-record/<str:pat_id>/', IndividualMedicineRecordView.as_view(), name='inv-medrecord'),
        path("user-     -items/", UserAllMedicineRequestItemsView.as_view(), name="user-pending-medicine-items"),
        path("user-all-items/", UserAllMedicineRequestItemsView.as_view(), name="user-all-medicine-items"),
        path('submit-request/', SubmitMedicineRequestView.as_view(), name='submit-medicine-request'),
        path('cancel-medicine-request-item/<int:medreqitem_id>/', MedicineRequestItemCancel.as_view(), name="cancel-medicine-request-item"),
        path('medicine-request/check-pending/<str:rp_id>/<str:med_id>/', CheckPendingMedicineRequestView.as_view(), name='check-pending-medicine-request'),
        path('user-requests/', UserMedicineRequestsView.as_view(), name='user-medicine-requests'),
        path('medicine-request-items-by-request/<str:medreq_id>/', MedicineRequestItemsByRequestView.as_view(), name='medicine_request_items_by_request'),
        
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