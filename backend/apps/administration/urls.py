from django.urls import path
from .views import *

urlpatterns = [
    path('positions/', PositionView.as_view(), name="positions-list"),
    path('positions/<int:pos_id>/', PositionDeleteView.as_view(), name='position-delete'),

    path('features/', FeatureView.as_view(), name='features-list'),
    path('features/assign/<int:feat>/', FeatureDataView.as_view(), name='feature-data'),

    path('assignment/', AssignmentView.as_view(), name='role-assignment'),
    path('assignment/<int:pos>/', AssignmentView.as_view(), name='assigned-feature'),
    path('assignment/<int:feat>/<int:pos>/', AssignmentDeleteView.as_view(), name='delete-assignment')

]   