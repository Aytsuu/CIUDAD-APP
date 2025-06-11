# from django.shortcuts import render
# from rest_framework import generics
# from .models import GAD_Budget_Tracker, GAD_Budget_Year
# from .serializers import GAD_Budget_TrackerSerializer, GADBudgetYearSerializer

# class GAD_Budget_TrackerView(generics.ListCreateAPIView):
#     queryset = GAD_Budget_Tracker.objects.all()
#     serializer_class = GAD_Budget_TrackerSerializer

# class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):  # Handles DELETE
#     queryset = GAD_Budget_Tracker.objects.all()
#     serializer_class = GAD_Budget_TrackerSerializer
#     lookup_field = 'gbud_num' 

# class GAD_Budget_YearView(generics.ListCreateAPIView):
#     queryset = GAD_Budget_Year.objects.all()
#     serializer_class = GADBudgetYearSerializer

from rest_framework.decorators import api_view
from django.shortcuts import render
from rest_framework import generics
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import GAD_Budget_Tracker, GAD_Budget_Year
from .serializers import GAD_Budget_TrackerSerializer, GADBudgetYearSerializer

class GAD_Budget_TrackerView(generics.ListCreateAPIView):
    serializer_class = GAD_Budget_TrackerSerializer
    
    def get_queryset(self):
        year = self.kwargs.get('year')
        if not year:
            raise NotFound("Year parameter is required")
        
        return GAD_Budget_Tracker.objects.filter(
            gbudy_num__gbudy_year=year
        ).select_related('gbudy_num')

class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'gbud_num'

class GAD_Budget_YearView(generics.ListCreateAPIView):
    queryset = GAD_Budget_Year.objects.all()
    serializer_class = GADBudgetYearSerializer