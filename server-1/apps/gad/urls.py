# from django.urls import path
# from .views import GAD_Budget_TrackerView, GAD_Budget_TrackerDetailView, get_gad_budget
# urlpatterns = [
#     path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view(), name="gad-budget-tracker-table"),
#     path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-update"),
#     path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-delete")
# ]

# from django.urls import path
# from .views import (
#     GAD_Budget_TrackerView,
#     GAD_Budget_TrackerDetailView,
#     get_gad_budget,
#     GADBudgetYearListView
# )

# urlpatterns = [
#     # Existing endpoints (unchanged)
#     path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view(), name="gad-budget-tracker-table"),
#     path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-update"),
#     path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), name="gad-budget-tracker-table-delete"),
#     path('gad-budget/total/<int:year>/', get_gad_budget, name='gad-total-budget'),
    
#     # New endpoints for budget years
#     path("gad-budget-tracker-main/", get_gad_budget, name="gad-budget-tracker-main"),
# ]

from django.urls import path
from .views import (
    GAD_Budget_TrackerView,
    GAD_Budget_TrackerDetailView,
    GAD_Budget_YearView
)

# urlpatterns = [
#     # Main page endpoint (no year parameter)
#     path("gad-budget-tracker-main/", GAD_Budget_YearView.as_view(), name="gad-budget-tracker-main"),
    
#     # Table CRUD endpoints
#     # path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view(), name="gad-budget-tracker-table"),
#     path("gad-budget-tracker-table/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view(), 
#          name="gad-budget-tracker-table-detail"),
#     path("gad-budget-tracker-table/<str:gbudy_year>/", 
#      GAD_Budget_TrackerView.as_view(), 
#      name="gad-budget-tracker-table"),
# ]


urlpatterns = [
    path("gad-budget-tracker-main/", GAD_Budget_YearView.as_view()),
    # Works with both filtered and unfiltered requests
    path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-table/<str:year>/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-entry/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view()),
]