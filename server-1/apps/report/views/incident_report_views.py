from rest_framework import generics
from django.db.models import Q
from ..serializers.incident_report_serializers import *
from ..models import IncidentReport
from apps.pagination import StandardResultsPagination
from rest_framework.permissions import AllowAny

class IRCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = IRCreateSerializer
  queryset = IncidentReport.objects.all()

class IRInfoView(generics.RetrieveAPIView):
  serializer_class = IRTableSerializer
  queryset = IncidentReport.objects.all()
  lookup_field = 'ir_id'
  
class IRTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = IRTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    is_archive = self.request.query_params.get('is_archive', 'false') == 'true'
    queryset = IncidentReport.objects.filter(
      ir_is_archive=is_archive
    ).select_related(
      'rt',
      'rp',
      'add'
    ).only(
      'ir_id',
      'ir_add_details',
      'ir_date',
      'ir_time',
      'ir_area',
      'ir_severity',
      'ir_involved',
      'rt__rt_label',
      'rp__per__per_lname',
      'rp__per__per_fname',
      'rp__per__per_mname'
    )

    search = self.request.query_params.get('search', '').strip()
    if search:
      queryset = queryset.filter(
        Q(ir_id__icontains=search) |
        Q(ir_add_details__icontains=search) |
        Q(ir_date__icontains=search) |
        Q(ir_time__icontains=search) |
        Q(add__sitio__sitio_name__icontains=search) |
        Q(add__add_street__icontains=search) |
        Q(rt__rt_label__icontains=search) |
        Q(rp__per__per_lname__icontains=search) |
        Q(rp__per__per_fname__icontains=search) |
        Q(rp__per__per_mname__icontains=search) 
      ).distinct()

    return queryset