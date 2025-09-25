from rest_framework import generics
from ..serializers.voter_serializers import VoterBaseSerialzer
from ..models import Voter
from apps.pagination import StandardResultsPagination
from django.db.models import Q

class VoterTableView(generics.ListAPIView):
  serializer_class = VoterBaseSerialzer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Voter.objects.all()
    search = self.request.query_params.get("search", "").strip()
    if search: 
      queryset = queryset.filter(
        Q(voter_name__icontains=search)
      )

    return queryset
  
