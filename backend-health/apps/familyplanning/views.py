from rest_framework import generics
from .models import Acknowledgement
from .serializers import AcknowledgementSerializer

class AcknowledgementView(generics.ListCreateAPIView):
    queryset = Acknowledgement.objects.all()
    serializer_class = AcknowledgementSerializer
