from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Q
from pagination import StandardResultsPagination
from apps.profiling.serializers.all_record_serializers import *
from apps.profiling.models import ResidentProfile, BusinessRespondent
from ..models import FamilyComposition

class AllRecordTableView(generics.GenericAPIView):
  serializer_class = AllRecordTableSerializer
  pagination_class = StandardResultsPagination

  def get(self, request, *args, **kwargs):
    search = request.query_params.get('search', '').strip()

    residents = [
      {
        'id': res.rp_id,
        'lname': res.per.per_lname,
        'fname': res.per.per_fname,
        'mname': res.per.per_mname,
        'suffix': res.per.per_suffix,
        'sex': res.per.per_sex,
        'date_registered': res.rp_date_registered,
        'family_no': (fam_comp.fam.fam_id if (fam_comp := FamilyComposition.objects.filter(rp=res.rp_id).first()) else None),
        'type': 'Resident',
      }
      for res in ResidentProfile.objects.select_related('per').filter(
          Q(per__per_fname__icontains=search) |
          Q(per__per_lname__icontains=search) |
          Q(per__per_mname__icontains=search) |
          Q(per__per_suffix__icontains=search)
      )
    ]
    respondents = [
      {
        'id': res.br_id,
        'lname': res.per.per_lname,
        'fname': res.per.per_fname,
        'mname': res.per.per_mname,
        'suffix': res.per.per_suffix,
        'sex': res.per.per_sex,
        'date_registered': res.br_date_registered,
        'type': 'Business',
      }
      for res in BusinessRespondent.objects.select_related('per').filter(
          Q(per__per_fname__icontains=search) |
          Q(per__per_lname__icontains=search) |
          Q(per__per_mname__icontains=search) |
          Q(per__per_suffix__icontains=search)
      )
    ]
    
    unified_data = residents + respondents
    page = self.paginate_queryset(unified_data)
    serializer = self.get_serializer(page, many=True)
    return self.get_paginated_response(serializer.data)
  