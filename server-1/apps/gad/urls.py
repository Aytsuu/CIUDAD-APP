from django.urls import path
from .views import GAD_Budget_TrackerView, GAD_Budget_TrackerDetailView
urlpatterns = [
    path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view(), name="gad-budget-tracker-table"),
    path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-update"),
    path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-delete"),
]