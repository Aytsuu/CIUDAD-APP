from django.urls import path
from .views import *


urlpatterns = [
  path('all-firstaid-record/', PatientFirstaidRecordsView.as_view(), name='all-firstaid-record'),
  path('indiv-firstaid-record/<str:pat_id>/', IndividualFirstaidRecordView.as_view(), name='indiv-firstaid-record'),
  path('create-firstaid-record/', CreateFirstaidRecordView.as_view(), name='create-firstaid-record'),
  path('firstaid-records/<int:farec_id>/archive/', ArchiveFirstaidRecordView.as_view(), name='archive-firstaid-record'),
  path('firstaid-records-count/<str:pat_id>/', GetFirstaidRecordCountView.as_view(), name='firstaid-records-count'),
  path('firstaid-records/monthly/', MonthlyFirstAidRecordsAPIView.as_view(), name='monthly_firstaid_records'),
]