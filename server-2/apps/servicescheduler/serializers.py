from rest_framework import serializers
from django.db import transaction
from .models import ServiceScheduler, Service, Day


class ServiceSerializer(serializers.ModelSerializer):
   class Meta:
      model = Service
      fields = ['service_id', 'service_name']


class DaySerializer(serializers.ModelSerializer):
   class Meta:
      model = Day
      fields = ['day_id', 'day', 'day_description']


class ServiceSchedulerCreateSerializer(serializers.ModelSerializer):
   service_name = serializers.CharField(write_only=True)
   day = serializers.CharField(write_only=True)
   # day_description = serializers.CharField(write_only=True)

   service_id = ServiceSerializer(source='service_id.service_name', read_only=True)
   day_id = DaySerializer(source='day_id.day', read_only=True)

   class Meta:
      model = ServiceScheduler
      fields = ['service_id', 'day_id', 'meridiem', 'service_name', 'day']

   def create(self, validated_data):
      service_name = validated_data.pop('service_name')
      day = validated_data.pop('day')

      print("Creating Service Scheduler with data:", validated_data)
      
      try: 
         with transaction.atomic():
            service, created = Service.objects.get_or_create(service_name=service_name)
            if created:
               print("Created New Service:", {service_name})
            
            day, created = Day.objects.get_or_create(
               day=day, 
               defaults = {
                  'day_description': f'{day} schedule'
               }
            )
            if created:
               print(f'Created New Day: {day}')

            service_scheduler = ServiceScheduler.objects.create(
               service_id=service,
               day_id=day,
               meridiem=validated_data['meridiem']
            )
            # print("Service Scheduler created successfully:", service_scheduler)
            return service_scheduler
      
      except Exception as e:
         error_msg = ("Error creating Service Scheduler:", e)
         raise serializers.ValidationError(error_msg)
      

class ServiceSchedulerListSerializer(serializers.ModelSerializer):
   service_name = serializers.CharField(source='service_id.service_name', read_only=True)
   day = serializers.CharField(source='day_id.day', read_only=True)
   day_description = serializers.CharField(source='day_id.day_description', read_only=True)

   class Meta:
      model = ServiceScheduler
      fields = ['ss_id', 'service_name', 'day', 'day_description', 'meridiem']