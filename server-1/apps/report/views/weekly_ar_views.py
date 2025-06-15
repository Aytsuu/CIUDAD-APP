from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from ..models import WeeklyAccomplishmentReport, WeeklyARComposition
from ..serializers.weekly_ar_serializers import *

class WARCreateView(generics.CreateAPIView):
  serializer_class = WARBaseSerializer
  queryset = WeeklyAccomplishmentReport.objects.all()

class WARCompCreateView(generics.CreateAPIView):
  serializer_class = WARCompBaseSerializer
  queryset = WeeklyARComposition

  @transaction.atomic
  def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data, many=True)
    serializer.is_valid(raise_exception=True)

    instances = [
      WeeklyARComposition(**item) for item in serializer.validated_data
    ]

    created_instances = WeeklyARComposition.objects.bulk_create(instances)

    if len(created_instances) > 0 and created_instances[0].pk is not None:
      response_serializer = self.get_serializer(created_instances, many=True)
      return Response(response_serializer.data, status=status.HTTP_201_CREATED)
  
    return Response({"detail": "Bulk create successful", "count": len(instances)},
      status=status.HTTP_201_CREATED
    )

class WARListView(generics.ListAPIView):
  serializer_class = WARListSerializer
  queryset = WeeklyAccomplishmentReport.objects.all().order_by('war_created_at')

class WARFileCreateView(generics.CreateAPIView):
  serializer_class = WARFileBaseSerializer
  queryset = WARFile.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data, many=True)
      serializer.is_valid(raise_exception=True)

      # Prepare model instances
      instances = [
          WARFile(**item)
          for item in serializer.validated_data
      ]
      created_instances = WARFile.objects.bulk_create(instances)

      war = WeeklyAccomplishmentReport.objects.filter(
        war_id=serializer.validated_data[0]['war'].pk
      ).first()
      if war:
        war.war_status = "Signed"
        war.save()
        
      if len(created_instances) > 0 and created_instances[0].pk is not None:
          return Response(status=status.HTTP_201_CREATED)
      
      return Response(status=status.HTTP_201_CREATED)