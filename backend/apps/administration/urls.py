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

]   