from django.urls import path
from .views import *

urlpatterns = [
    path("gad-budget-tracker-main/", GAD_Budget_YearView.as_view()),
    path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-table/<str:year>/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-entry/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view()),
    path("gad-budget-tracker-entry/<int:gbud_num>/restore/", GADBudgetRestoreView.as_view()),
    path("gad-budget-files/", GADBudgetFileView.as_view()),
    path("gad-budget-files/<int:pk>/", GADBudgetFileDetailView.as_view()),
    path("project-proposals-availability/<str:year>/", ProjectProposalForBT.as_view(), name='project-proposal-availability'),
    path("project-proposals-available/<str:year>/", ProjectProposalForProposal.as_view(), name='project-proposal-availability'),
    path("budget-logs/<str:year>/", GADBudgetLogListView.as_view(), name="gad-budget-log-list"),
    path('gad-budget-aggregates/<str:year>/', GADBudgetAggregatesView.as_view()),
    
    path('project-proposals/', ProjectProposalView.as_view(), name='project-proposal-list'),
    path('project-proposals/<int:gpr_id>/', ProjectProposalDetailView.as_view(), name='project-proposal-detail'),
    path('api/staff/', StaffListView.as_view(), name='staff-list'),
    path('project-proposals/<int:proposal_id>/support-docs/',ProposalSuppDocCreateView.as_view(),name='proposal-support-docs'),
    path('support-docs/<int:psd_id>/',ProposalSuppDocDetailView.as_view(),name='support-doc-detail'),
    path('project-proposals/<int:gpr_id>/archive/', ProjectProposalArchiveView.as_view(), name='project-proposal-archive'),
    path('project-proposals/<int:gpr_id>/restore/', ProjectProposalRestoreView.as_view(), name='project-proposal-restore'),
    path('project-proposal-years/', ProjectProposalYearsView.as_view(), name='project-proposal-years'),
    path('project-proposals-grand-total/', ProjectProposalGrandTotalView.as_view()),
    
    path('gad-annual-development-plan/', GADDevelopmentPlanListCreate.as_view()),
    path('gad-annual-development-plan/years/', GADDevelopmentPlanYears.as_view()),
    path('gad-annual-development-plan/<int:dev_id>/', GADDevelopmentPlanUpdate.as_view()),
    path('development-plans/<int:dev_id>/archive/', GADDevelopmentPlanArchiveView.as_view()),
    path('gad-annual-development-plan/<int:dev_id>/restore/', GADDevelopmentPlanRestoreView.as_view()),
    path('gad-annual-development-plan/bulk-update/', GADDevelopmentPlanBulkUpdate.as_view()),
    path('gad-annual-development-plan/bulk-delete/', GADDevelopmentPlanBulkDelete.as_view()),
    
]