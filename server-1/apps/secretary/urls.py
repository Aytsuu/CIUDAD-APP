from django.urls import path
from .views import (
    OrdinanceListView,
    OrdinanceDetailView,
    OrdinanceArchiveView,
    OrdinanceSupplementaryDocListView,
    OrdinanceSupplementaryDocDetailView,
    OrdinanceSupplementaryDocArchiveView,
    OrdinanceTemplateListView,
    OrdinanceTemplateDetailView,
    OrdinanceTemplateArchiveView
)

urlpatterns = [
    # Ordinance endpoints
    path('ordinance/', OrdinanceListView.as_view(), name='ordinance-list'),
    path('ordinance/<str:pk>/', OrdinanceDetailView.as_view(), name='ordinance-detail'),
    path('ordinance/<str:pk>/archive/', OrdinanceArchiveView.as_view(), name='ordinance-archive'),
    
    # Supplementary document endpoints
    path('ordinance-docs/', OrdinanceSupplementaryDocListView.as_view(), name='ordinance-docs-list'),
    path('ordinance-docs/<str:pk>/', OrdinanceSupplementaryDocDetailView.as_view(), name='ordinance-docs-detail'),
    path('ordinance-docs/<str:pk>/archive/', OrdinanceSupplementaryDocArchiveView.as_view(), name='ordinance-docs-archive'),
    
    # Template endpoints
    path('templates/', OrdinanceTemplateListView.as_view(), name='template-list'),
    path('templates/<int:pk>/', OrdinanceTemplateDetailView.as_view(), name='template-detail'),
    path('templates/<int:pk>/archive/', OrdinanceTemplateArchiveView.as_view(), name='template-archive'),
] 