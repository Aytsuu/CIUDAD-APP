from rest_framework import generics, status
from apps.pagination import StandardResultsPagination
from ..models import RequestRegistration
from ..serializers.request_registration_serializers import *

class RequestTableView(generics.ListAPIView):
  serializer_class = RequestTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = RequestRegistration.objects.all()
    

    return queryset