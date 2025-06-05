from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime
from rest_framework.permissions import AllowAny


class CouncilSchedulingView(generics.ListCreateAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()

class AttendeesView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilScheduling.objects.all()

class AttendanceView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilScheduling.objects.all()

#TEMPLATE
class TemplateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.filter(temp_is_archive=False) 

#Use as updating the values as well as archiving 
class UpdateTemplateView(generics.RetrieveUpdateAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.filter(temp_is_archive=False) 
    lookup_field = 'temp_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
