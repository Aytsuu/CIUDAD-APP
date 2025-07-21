from rest_framework import generics
from ..serializers.staff_serializers import *
from pagination import *

class StaffTableView(generics.RetrieveAPIView):
  serializer_class = StaffTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    staffs = Staff.objects.select_related(
      
    )