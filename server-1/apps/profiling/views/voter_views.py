from rest_framework import generics
from ..serializers.voter_serializers import VoterBaseSerialzer
from django.db.models import Q
from ..models import Voter
from apps.pagination import StandardResultsPagination

class VoterTableView(generics.ListAPIView):
  serializer_class = VoterBaseSerialzer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Voter.objects.all()
    search_query = self.request.query_params.get("search", '').strip()
    search_list = search_query.split(' ')
    if len(search_list) > 0:
      for search in search_list:
        queryset = queryset.filter(
          Q(voter_name__icontains=search) |
          Q(voter_address__icontains=search) | 
          Q(voter_precinct__icontains=search) 
        )

    return queryset
  
