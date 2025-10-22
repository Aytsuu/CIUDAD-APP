from rest_framework import generics
from ..serializers.voter_serializers import VoterBaseSerialzer
from ..models import Voter
from apps.pagination import StandardResultsPagination

class VoterTableView(generics.ListAPIView):
  serializer_class = VoterBaseSerialzer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = Voter.objects.all()
    return queryset
  
