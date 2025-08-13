from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from ..serializers.staff_serializers import *
from pagination import *

class StaffCreateView(generics.CreateAPIView):
  serializer_class = StaffCreateSerializer
  queryset = Staff.objects.all()

class StaffTableView(generics.ListCreateAPIView):
  serializer_class = StaffTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Staff.objects.select_related(
      'rp',
      'pos',
    ).only(
      'staff_id',
      'staff_assign_date',
      'staff_type',
      'rp__per__per_lname',
      'rp__per__per_fname',
      'rp__per__per_mname',
      'rp__per__per_contact',
      'pos__pos_title'
    )

    # Add staff_type filtering (but don't filter out Admin users)
    staff_type_filter = self.request.query_params.get('staff_type', '').strip()
    if staff_type_filter and staff_type_filter != 'Admin':
      queryset = queryset.filter(staff_type=staff_type_filter)

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(staff_assign_date__icontains=search_query) |
        Q(rp__per__per_lname__icontains=search_query) |
        Q(rp__per__per_fname__icontains=search_query) |
        Q(rp__per__per_mname__icontains=search_query) |
        Q(rp__per__per_contact__icontains=search_query) |
        Q(pos__pos_title__icontains=search_query) |
        Q(staff_type__icontains=search_query)
      ).distinct()

    return queryset
  
class StaffUpdateView(generics.UpdateAPIView):
  serializer_class = StaffBaseSerializer
  queryset = Staff.objects.all()
  lookup_field = 'staff_id'

  def update(self, request, *args, **kwargs):
    pos = request.data['pos']
    pos_data = Position.objects.filter(pos_id=pos).first()
    max_holders = pos_data.pos_max
    holders = Staff.objects.filter(pos=pos)

    if len(holders) < max_holders:
      instance = self.get_object()
      serializer = self.get_serializer(instance, data=request.data, partial=True)

      if serializer.is_valid():
          serializer.save()
          return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)
  
class StaffDeleteView(generics.DestroyAPIView):
  serializer_class = StaffBaseSerializer
  queryset = Staff.objects.all()
  lookup_field = "staff_id"

class StaffDataByTitleView(APIView):
  def get(self, request, *args, **kwargs):
    title = request.query_params.get('pos_title', None)

    if title == "all":
      staff = Staff.objects.all()
      return Response(StaffTableSerializer(staff, many=True).data)
    
    req_position = Position.objects.get(pos_title=title)
    staff = Staff.objects.filter(pos=req_position.pos_id)
    return Response(StaffTableSerializer(staff, many=True).data)

class StaffLandingPageView(generics.ListAPIView):
  serializer_class = StaffLandingPageSerializer
  queryset = Staff.objects.filter(~Q(pos__pos_title='Admin') & Q(staff_type='Barangay Staff'))
