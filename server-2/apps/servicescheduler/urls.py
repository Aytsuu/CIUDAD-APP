from django.urls import path
from .views import ServiceSchedulerCreateView, ServiceSchedulerListView


urlpatterns = [
	path('service-scheduler/create/', ServiceSchedulerCreateView.as_view(), name='service-scheduler-create'),
	# path('service-scheduler/<int:ss_id>/', ServiceSchedulerDetailView.as_view(), name='service-scheduler-detail'),
	path('service-scheduler/', ServiceSchedulerListView.as_view(), name='service-scheduler-list'),
]