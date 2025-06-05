# council/views.py (unchanged)
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

class CouncilSchedulingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()
    lookup_field = 'ce_id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.ce_is_archive = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AttendeesView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilAttendees.objects.all()

class AttendeesDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilAttendees.objects.all()
    lookup_field = 'atn_id'

class AttendanceView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'

Staff = apps.get_model('administration', 'Staff')
class StaffListView(generics.ListAPIView):
    queryset = Staff.objects.select_related('pos', 'rp__per').only(
        'staff_id',
        'rp__per__per_fname',
        'rp__per__per_lname',
        'pos__pos_title'
    )
    serializer_class = StaffSerializer

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
