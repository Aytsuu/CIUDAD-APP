from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ServiceSchedulerCreateSerializer, ServiceSerializer, DaySerializer, ServiceSchedulerListSerializer
from .models import ServiceScheduler, Service, Day
from django.db import transaction, IntegrityError
import logging

logger = logging.getLogger(__name__)

# Create your views here.
class ServiceListCreateView(generics.ListCreateAPIView):
   serializer_class = ServiceSerializer
   queryset = Service.objects.all()

   def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      instance = serializer.save()

      return Response({
         'service_id': instance.service_id,
         'service_name': instance.service_name
      }, status=status.HTTP_201_CREATED)

class ServiceDetailView(generics.RetrieveUpdateAPIView):
   serializer_class = ServiceSerializer
   queryset = Service.objects.all()
   lookup_field = 'service_id'

class ServiceDeleteView(generics.DestroyAPIView):
   queryset = Service.objects.all()
   lookup_field = 'service_id'

   def destroy(self, request, *args, **kwargs):
      try:
         service = self.get_object()
         service_name = service.service_name
         service_id = service.service_id

         with transaction.atomic():
            deleted_schedules = ServiceScheduler.objects.filter(service_id=service_id).delete()
            
            service.delete()
         
         logger.info(f'Service deleted successfully')

         return Response({
            'message': f'Service "{service_name}" deleted successfully',
            'deleted_schedules': deleted_schedules[0] if deleted_schedules[0] else 0
         }, status=status.HTTP_200_OK)

      except Exception as e:
         logger.error(f"Error deleting service: {e}")
         return Response({
            'error': f'Failed to delete service: {str(e)}'
         }, status=status.HTTP_400_BAD_REQUEST)

   
class DayListCreateView(generics.ListCreateAPIView):
   serializer_class = DaySerializer
   queryset = Day.objects.all()

   def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      instance = serializer.save()

      return Response({
         'day_id': instance.day_id,
         'day': instance.day,
         'day_description': instance.day_description
      }, status=status.HTTP_201_CREATED)
   
class DayDetailView(generics.RetrieveUpdateAPIView):
   serializer_class = DaySerializer
   queryset = Day.objects.all()
   lookup_field = 'day_id'

class DayDeleteView(generics.DestroyAPIView):
   queryset = Day.objects.all()
   lookup_field = 'day_id'

   def destroy(self, request, *args, **kwargs):
      try:
         day = self.get_object()
         day_name = day.day
         day_id = day.day_id

         with transaction.atomic():
            deleted_schedules = ServiceScheduler.objects.filter(day_id=day_id).delete()

            day.delete()
         
         return Response({
            'message': f'Day {day_name} deleted successfully',
            'deleted_schedules': deleted_schedules[0] if deleted_schedules[0] else 0
         }, status=status.HTTP_200_OK)

      except Exception as e:
         return Response({
            'error': f'Failed to delete day: {str(e)}'
         }, status=status.HTTP_400_BAD_REQUEST)


class ServiceSchedulerCreateView(generics.ListCreateAPIView):
   serializer_class = ServiceSchedulerCreateSerializer
   queryset = ServiceScheduler.objects.all()

   def create(self, request, *args, **kwargs):
      logger.info("Creating Service Scheduler with data: %s", request.data)

      serializer = self.get_serializer(data=request.data)

      if not serializer.is_valid():
         logger.error("Service Scheduler creation failed: %s", serializer.errors)
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

      try:
         instance = serializer.save()
         
         return Response({
            'ss_id': instance.ss_id,
            'service_name': instance.service_id.service_name,
            'day': instance.day_id.day,
            'day_description': instance.day_id.day_description,
            'meridiem': instance.meridiem
         }, status=status.HTTP_201_CREATED)
      
      except IntegrityError as e:
         logger.error(f"Database integrity error: {e}")
         return Response(
               {
                  'error': 'Database constraint violation',
                  'message': 'This schedule may already exist'
               },
               status=status.HTTP_400_BAD_REQUEST
         )
      
      except Exception as e:
         logger.error(f"Unexpected error creating scheduler: {e}")
         return Response(
               {
                  'error': 'Failed to create schedule',
                  'message': str(e)
               },
               status=status.HTTP_400_BAD_REQUEST
         )

class ServiceSchedulerUpdateView(generics.UpdateAPIView):
   serializer_class = ServiceSchedulerCreateSerializer
   queryset = ServiceScheduler.objects.all()
   lookup_field = 'ss_id'

   def update(self, request, *args, **kwargs):
      logger.info(f"Updating scheduler {kwargs.get('ss_id')}: {request.data}")
      
      try:
         instance = self.get_object()
         serializer = self.get_serializer(instance, data=request.data, partial=True)
         
         if not serializer.is_valid():
               logger.error(f"Update validation errors: {serializer.errors}")
               return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
         
         updated_instance = serializer.save()
         
         return Response({
               'ss_id': updated_instance.ss_id,
               'service_name': updated_instance.service_id.service_name,
               'day': updated_instance.day_id.day,
               'meridiem': updated_instance.meridiem,
               'message': 'Schedule updated successfully'
         }, status=status.HTTP_200_OK)
         
      except Exception as e:
         logger.error(f"Error updating scheduler: {e}")
         return Response(
               {'error': f'Failed to update schedule: {str(e)}'},
               status=status.HTTP_400_BAD_REQUEST
         )

class ServiceSchedulerDeleteView(generics.DestroyAPIView):
    queryset = ServiceScheduler.objects.all()
    lookup_field = 'ss_id'

    def destroy(self, request, *args, **kwargs):
      try:
         instance = self.get_object()
         ss_id = instance.ss_id
         instance.delete()
         
         return Response({
               'message': f'Schedule {ss_id} deleted successfully'
         }, status=status.HTTP_200_OK)
         
      except Exception as e:
         return Response(
               {'error': f'Failed to delete schedule: {str(e)}'},
               status=status.HTTP_400_BAD_REQUEST
         )

class ServiceSchedulerListView(generics.ListAPIView):
   serializer_class = ServiceSchedulerListSerializer
   queryset = ServiceScheduler.objects.select_related('service_id', 'day_id').all()