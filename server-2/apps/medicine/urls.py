from django.urls import path
from .views import *

urlpatterns=[
        path('all-medicine-records/', PatientMedicineRecordsView.as_view(), name='all-medrecords'),
        path('indiv-medicine-record/<str:pat_id>/', IndividualMedicineRecordView.as_view(), name='inv-medrecord'),

   ]