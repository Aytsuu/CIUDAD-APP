from rest_framework import generics, status
from rest_framework.response import Response
from ..serializers.rep_template_serializers import *
from ..models import ReportTemplate

class RTEListCreateView(generics.ListCreateAPIView):
  serializer_class = RepTemplateBaseSerializer
  queryset = ReportTemplate.objects.all()

class RTEUpdateView(generics.UpdateAPIView):
  serializer_class = RepTemplateBaseSerializer
  queryset = ReportTemplate.objects.all()
  lookup_field = 'rte_type'

class RTESpecificTypeView(generics.RetrieveAPIView):
  serializer_class = RepTemplateBaseSerializer 
  queryset = ReportTemplate.objects.all()
  lookup_field = 'rte_type'

  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)