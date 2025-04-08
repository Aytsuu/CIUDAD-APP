from rest_framework import generics, permissions
from .models import Blotter
from .serializers import BlotterSerializer
from rest_framework.parsers import MultiPartParser, FormParser


class BlotterCreateView(generics.CreateAPIView):
    queryset = Blotter.objects.all()
    serializer_class = BlotterSerializer
    # permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # For file uploads

    def perform_create(self, serializer):
        serializer.save()

class BlotterListView(generics.ListAPIView):
    serializer_class = BlotterSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Blotter.objects.all()