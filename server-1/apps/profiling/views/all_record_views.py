from rest_framework import generics, status
from rest_framework.response import Response
from pagination import StandardResultsPagination
from apps.profiling.serializers.all_record_serializers import *
from apps.profiling.models import ResidentProfile, BusinessRespondent

class AllRecordTableView(generics.GenericAPIView):
  serializer_class = AllRecordTableSerializer
  pagination_class = StandardResultsPagination

  def get(self, request, *args, **kwargs):
    residents = [
      {
        'lname': res.per.per_lname,
        'fname': res.per.per_fname,
        'mname': res.per.per_mname
      }
      for res in ResidentProfile.objects.all()
    ]
    respondents = [
      {
        'lname': res.per.per_lname,
        'fname': res.per.per_fname,
        'mname': res.per.per_mname
      }
      for res in BusinessRespondent.objects.all()
    ]
    
    unified_data = residents + respondents
    page = self.paginate_queryset(unified_data)
    serializer = self.get_serializer(page, many=True)
    return self.get_paginated_response(serializer.data)
  