from django.urls import path
from .views import *


urlpatterns = [
  path('all-firstaid-record/', PatientFirstaidRecordsView.as_view(), name='all-firstaid-record'),
  path('indiv-firstaid-record/<str:pat_id>/', IndividualFirstaidRecordView.as_view(), name='indiv-firstaid-record'),
  path('create-firstaid-record/', CreateFirstaidRecordView.as_view(), name='create-firstaid-record'),
  
  path('firstaid-totalrecords/', FirstAidTotalCountAPIView.as_view(), name='firstaid-record-totalrecords'),
  path('firstaid-records-count/<str:pat_id>/', GetFirstaidRecordCountView.as_view(), name='firstaid-records-count'),
  
  path('firstaid-records/monthly/', MonthlyFirstAidSummariesAPIView.as_view(), name='monthly_firstaid_records'),
  path('firstaid-reports/<str:month>/', MonthlyFirstAidRecordsDetailAPIView.as_view(), name='firstaid-reports'),
  path('firstaid-records/monthly/chart/<str:month>/', MonthlyFirstAidChart.as_view(), name='firstaid_records_list'),
]