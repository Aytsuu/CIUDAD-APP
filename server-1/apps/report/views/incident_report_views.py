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

class TrackerReportCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = IRBaseSerializer
  queryset = IncidentReport.objects.all()

class IRInfoView(generics.RetrieveAPIView):
  serializer_class = IRTableSerializer
  queryset = IncidentReport.objects.all()
  lookup_field = 'ir_id'

class IRUpdateView(generics.UpdateAPIView):
  serializer_class = IRBaseSerializer
  queryset = IncidentReport.objects.all()
  lookup_field = 'ir_id'
  
class IRTableView(generics.ListAPIView):
  permission_classes = [AllowAny]
  serializer_class = IRTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    search = self.request.query_params.get('search', '').strip()
    rp_id = self.request.query_params.get("rp_id", None)
    is_get_tracker = self.request.query_params.get('get_tracker', None)
    is_archive = self.request.query_params.get('is_archive', 'false') == 'true'
    severity = self.request.query_params.get("severity", None)
    verified = self.request.query_params.get("verified", 'false') == 'true'
    status = self.request.query_params.get("status", None)

    queryset = IncidentReport.objects.filter(
      ir_is_archive=is_archive,
    ).select_related(
      'rt',
      'rp',
    ).only(
      'ir_id',
      'ir_add_details',
      'ir_date',
      'ir_time',
      'ir_area',
      'ir_severity',
      'ir_involved',
      'ir_is_tracker',
      'ir_track_rep_id',
      'ir_track_lat',
      'ir_track_lng',
      'ir_track_user_lat',
      'ir_track_user_lng',
      'ir_track_user_contact',
      'ir_track_user_name',
      'ir_status',
      'rt__rt_label',
      'rp__per__per_lname',
      'rp__per__per_fname',
      'rp__per__per_mname'
    )

    if is_get_tracker:
      queryset = queryset.filter(ir_is_tracker=True) if is_get_tracker == "true" \
        else queryset.filter(ir_is_tracker=False)

    """ Applying filters """
    # Filter by verified status
    queryset = queryset.filter(ir_is_verified=True) if verified  \
      else queryset.filter(ir_is_verified=False) 
    
    # Filter by resolution status
    if status and status != "all":
      queryset = queryset.filter(ir_status__iexact=status)

    # Filter by resident id
    if rp_id:
      queryset = queryset.filter(rp=rp_id)
    
    # Filter by severity
    if severity and severity != "all":
      queryset = queryset.filter(ir_severity__iexact=severity)

    # Filter by search query
    if search:
      queryset = queryset.filter(
        Q(ir_id__icontains=search) |
        Q(ir_add_details__icontains=search) |
        Q(ir_date__icontains=search) |
        Q(ir_time__icontains=search) |
        Q(ir_track_user_name__icontains=search) |
        Q(rt__rt_label__icontains=search) |
        Q(rp__per__per_lname__icontains=search) |
        Q(rp__per__per_fname__icontains=search) |
        Q(rp__per__per_mname__icontains=search) 
      ).distinct()

    return queryset.order_by('-ir_updated_at') if verified \
      else queryset.order_by('-ir_created_at')