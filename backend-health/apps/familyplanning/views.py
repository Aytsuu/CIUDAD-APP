from rest_framework import generics
from .models import Acknowledgement
from .serializers import *

class AcknowledgementView(generics.ListCreateAPIView):
    queryset = Acknowledgement.objects.all()
    serializer_class = AcknowledgementSerializer

class RiskVawView(generics.ListCreateAPIView):
    serializer_class = RiskVawSerializer
    queryset = Risk_vaw.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
