from django.urls import path
from .views.position_views import *
from .views.feature_views import *
from .views.assignment_views import *
from .views.permission_views import *
from .views.staff_views import *

urlpatterns = [
    # Staff Urls
    path('staff/list/table/', StaffTableView.as_view(), name='staff-list'),
    path('staff/', StaffCreateView.as_view()),
    path('position/', PositionView.as_view(), name="positions-list"),
    path('position/delete/<int:pos_id>/', PositionDeleteView.as_view(), name='position-delete'),
    path('position/update/<int:pos_id>/', PositionUpdateView.as_view(), name='position-update'),
    
    # Feature Urls 
    path('feature/', FeatureView.as_view(), name='features-list'),
    path('feature/assign/<int:feat>/', FeatureDataView.as_view(), name='feature-data'),

    # Assignment Urls
    path('assignment/list/', AssignmentView.as_view(), name='role-assignment'),
    path('assignment/create/', AssignmentCreateView.as_view(), name='assignment-create'),
    path('assignment/<int:pos>/', AssignmentFilteredView.as_view(), name='assigned-feature'),
    path('assignment/delete/<int:feat>/<int:pos>/', AssignmentDeleteView.as_view(), name='delete-assignment'),

    # Permission Urls 
    path('permission/', PermissionView.as_view(), name='permissions-list'),
    path('permission/update/<int:assi>/', PermissionUpdateView.as_view(), name='permission-update'),
]   