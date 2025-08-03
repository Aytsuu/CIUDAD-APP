from django.urls import path
from .views import ( 
				ServiceSchedulerCreateView, ServiceSchedulerListView, 
				ServiceListCreateView, ServiceDetailView, ServiceDeleteView, DayListCreateView, 
				DayDetailView, DayDeleteView)


urlpatterns = [
	# service endpoints
	path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
	path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
	path('services/<int:service_id>/delete/', ServiceDeleteView.as_view(), name='service-delete'),

	# day endpoints
	path('days/', DayListCreateView.as_view(), name='day-list-create'),
	path('days/<int:pk>/', DayDetailView.as_view(), name='day-detail'),
	path('days/<int:day_id>/delete/', DayDeleteView.as_view(), name='day-delete'),


	# service scheduler endpoints
	path('service-scheduler/create/', ServiceSchedulerCreateView.as_view(), name='service-scheduler-create'),
	path('service-scheduler/', ServiceSchedulerListView.as_view(), name='service-scheduler-list'),
]