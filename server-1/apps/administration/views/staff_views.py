from rest_framework import generics
from django.db.models import Q
from ..serializers.staff_serializers import *
from pagination import *

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
      'rp__per__per_lname',
      'rp__per__per_fname',
      'rp__per__per_mname',
      'rp__per__per_contact',
      'pos__pos_title'
    )

    search_query = self.request.query_params.get('search', '').strip()
    if search_query:
      queryset = queryset.filter(
        Q(staff_assign_date__icontains=search_query) |
        Q(rp__per__per_lname__icontains=search_query) |
        Q(rp__per__per_fname__icontains=search_query) |
        Q(rp__per__per_mname__icontains=search_query) |
        Q(rp__per__per_contact__icontains=search_query) |
        Q(pos__pos_title__icontains=search_query) 
      ).distinct()

    return queryset