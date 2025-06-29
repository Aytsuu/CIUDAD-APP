from django.urls import path
from .views import *

urlpatterns = [
    path("development-budget-items/", DevelopmentBudgetItemsView.as_view()),

    path("gad-budget-tracker-main/", GAD_Budget_YearView.as_view()),
    path("gad-budget-tracker-table/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-table/<str:year>/", GAD_Budget_TrackerView.as_view()),
    path("gad-budget-tracker-entry/<int:gbud_num>/", GAD_Budget_TrackerDetailView.as_view()),
    path("gad-budget-tracker-entry/<int:gbud_num>/restore/", GADBudgetRestoreView.as_view()),
    path("gad-budget-files/", GADBudgetFileView.as_view()),
    path("gad-budget-files/<int:pk>/", GADBudgetFileDetailView.as_view()),

    path('project-proposals/', ProjectProposalView.as_view(), name='project-proposal-list'),
    path('project-proposals/<int:gpr_id>/', ProjectProposalDetailView.as_view(), name='project-proposal-detail'),
    path('project-proposals/<int:gpr_id>/logs/', ProjectProposalLogView.as_view(), name='project-proposal-logs'),
    path('review-project-proposals/<int:gpr_id>/', UpdateProposalStatusView.as_view(), name='update-proposal-status'),
    path('api/staff/', StaffListView.as_view(), name='staff-list'),
    path('project-proposals/<int:proposal_id>/support-docs/',ProposalSuppDocCreateView.as_view(),name='proposal-support-docs'),
    path('support-docs/<int:psd_id>/',ProposalSuppDocDetailView.as_view(),name='support-doc-detail'),
    path('project-proposals/<int:gpr_id>/archive/', ProjectProposalArchiveView.as_view(), name='project-proposal-archive'),
    path('project-proposals/<int:gpr_id>/restore/', ProjectProposalRestoreView.as_view(), name='project-proposal-restore'),
]