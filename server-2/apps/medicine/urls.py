from django.urls import path
from .views import *

urlpatterns=[
        path('all-medicine-records/', PatientMedicineRecordsView.as_view(), name='all-medrecords'),
        path('indiv-medicine-record/<str:pat_id>/', IndividualMedicineRecordView.as_view(), name='inv-medrecord'),
        path('create-medicine-record/', CreateMedicineRecordView.as_view(), name='create-medrecord'),
        path('medrec-count/<str:pat_id>/', GetMedRecordCountView.as_view(), name='medrec-count'),
        path('medicine-records/monthly/', MonthlyFirstAidRecordsAPIView.as_view(), name='monthly_medicine_records'),

   ]