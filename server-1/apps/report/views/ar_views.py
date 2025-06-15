from rest_framework import generics, status
from rest_framework.response import Response
from ..models import AcknowledgementReport
from ..serializers.ar_serializers import *
from apps.pagination import StandardResultsPagination

class ARCreateView(generics.CreateAPIView):
  serializer_class = ARCreateSerializer
  queryset = AcknowledgementReport.objects.all()

class ARTableView(generics.ListAPIView):
  serializer_class = ARTableSerializer
  queryset = AcknowledgementReport.objects.all()
  pagination_class = StandardResultsPagination

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