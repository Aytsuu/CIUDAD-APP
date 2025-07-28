from rest_framework import serializers
from django.db import transaction
from .models import ServiceScheduler

class ServiceSchedulerCreateSerializer(serializers.ModelSerializer):
   class Meta:
      model = ServiceScheduler
      fields = ['service', 'meridiem']

   def create(self, validated_data):
      print("Creating Service Scheduler with data:", validated_data)
      
      try: 
         with transaction.atomic():
            service_scheduler = ServiceScheduler.objects.create(**validated_data)
            print("Service Scheduler created successfully:", service_scheduler)
            return service_scheduler
      
      except Exception as e:
         error_msg = ("Error creating Service Scheduler:", e)
         raise serializers.ValidationError(error_msg)