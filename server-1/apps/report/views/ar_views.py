from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q
from ..models import AcknowledgementReport
from ..serializers.ar_serializers import *
from apps.pagination import StandardResultsPagination

class ARCreateView(generics.CreateAPIView):
  serializer_class = ARCreateSerializer
  queryset = AcknowledgementReport.objects.all()

class ARTableView(generics.ListAPIView):
  serializer_class = ARTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = AcknowledgementReport.objects.select_related(
      'add',
    ).only(
      'ar_id',
      'ar_title',
      'ar_date_started',
      'ar_time_started',
      'ar_date_completed',
      'ar_time_completed',
      'ar_created_at',
      'ar_status',
      'ar_result',
      'add__sitio__sitio_name',
      'add__add_street',
    )

    search = self.request.query_params.get('search', '').strip()
    if search:
      queryset = queryset.filter(
          Q(ar_id__icontains=search) |
          Q(ar_title__icontains=search) | 
          Q(ar_created_at__icontains=search) |
          Q(ar_status__icontains=search)
      ).distinct()

    return queryset


class ARFileCreateView(generics.CreateAPIView):
  serializer_class = ARFileBaseSerializer
  queryset = ARFile.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data, many=True)
      serializer.is_valid(raise_exception=True)

      # Prepare model instances
      instances = [
          ARFile(**item)
          for item in serializer.validated_data
      ]
      created_instances = ARFile.objects.bulk_create(instances)

      # Check for pdf, docs, word upload
      contains_doc = [
        item for item in serializer.validated_data
        if item['arf_type'] == "application/pdf" 
      ]

      if contains_doc:
        ar = AcknowledgementReport.objects.filter(ar_id=contains_doc[0]['ar'].pk).first()
        if ar:
          ar.ar_status = "Signed"
          ar.save()
        
      if len(created_instances) > 0 and created_instances[0].pk is not None:
          return Response(status=status.HTTP_201_CREATED)
      
      return Response(status=status.HTTP_201_CREATED)