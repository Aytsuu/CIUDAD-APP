from django.shortcuts import render
from rest_framework import generics
from .models import GAD_Budget_Tracker
from .serializers import GAD_Budget_TrackerSerializer

class GAD_Budget_TrackerView(generics.ListCreateAPIView):
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer

class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):  # Handles DELETE
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'don_num' 