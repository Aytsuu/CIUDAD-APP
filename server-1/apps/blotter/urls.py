from django.urls import path
from .views import(
    BlotterReportListCreate, BlotterReportDetail, ComplainantListCreate, AccusedListCreate
)

urlpatterns = [
    path("reports/", BlotterReportListCreate.as_view(), name="report-list"),
    path("reports/<int:pk>/", BlotterReportDetail.as_view(), name="report-detail"),
    path("complainants/", ComplainantListCreate.as_view(), name="complainant-list"),
    path("accused/", AccusedListCreate.as_view(), name="accused-list"),
]