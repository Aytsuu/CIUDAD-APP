from django.urls import path
from .views import *

urlpatterns = [

    # Position Urls 

    path('positions/', PositionView.as_view(), name="positions-list"),
    path('positions/<int:pos_id>/', PositionDeleteView.as_view(), name='position-delete'),

    # Feature Urls 

    path('features/', FeatureView.as_view(), name='features-list'),
    path('features/assign/<int:feat>/', FeatureDataView.as_view(), name='feature-data'),

    # Assignment Urls

    path('assignments/', AssignmentView.as_view(), name='role-assignment'),
    path('assignments/<int:pos>/', AssignmentView.as_view(), name='assigned-feature'),
    path('assignments/<int:feat>/<int:pos>/', AssignmentDeleteView.as_view(), name='delete-assignment'),

    # Permission Urls 

    path('permissions/', PermissionView.as_view(), name='permissions-list'),
    path('permissions/<int:assi>/', PermissionUpdateView.as_view(), name='permission-update'),

    # Staff Urls

    path('staffs/', StaffView.as_view(), name='staff-list'),
    path('position/', PositionView.as_view(), name="positions-list"),
    path('position/<int:pos_id>/', PositionDeleteView.as_view(), name='position-delete'),

    # Feature Urls 

    path('feature/', FeatureView.as_view(), name='features-list'),
    path('feature/assign/<int:feat>/', FeatureDataView.as_view(), name='feature-data'),

    # Assignment Urls

    path('assignment/', AssignmentView.as_view(), name='role-assignment'),
    path('assignment/<int:pos>/', AssignmentView.as_view(), name='assigned-feature'),
    path('assignment/<int:feat>/<int:pos>/', AssignmentDeleteView.as_view(), name='delete-assignment'),

    # Permission Urls 

    path('permission/', PermissionView.as_view(), name='permissions-list'),
    path('permission/<int:assi>/', PermissionUpdateView.as_view(), name='permission-update'),

    # Staff Urls

    path('staff/', StaffView.as_view(), name='staff-list'),
    
    

]   