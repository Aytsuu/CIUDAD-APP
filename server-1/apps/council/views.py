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
import logging

logger = logging.getLogger(__name__)

class CouncilSchedulingView(generics.ListCreateAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()

class CouncilSchedulingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()
    lookup_field = 'ce_id'

    def get_object(self):
        # Use the lookup_field (ce_id) from URL kwargs
        queryset = self.get_queryset()
        lookup_value = self.kwargs[self.lookup_field]
        try:
            obj = queryset.get(pk=lookup_value)
        except CouncilScheduling.DoesNotExist:
            raise status.HTTP_404_NOT_FOUND  # Let Django handle 404
        return obj

    def get(self, request, *args, **kwargs):
        # Already handled by RetrieveUpdateDestroyAPIView's default get
        return super().get(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        # Already handled by RetrieveUpdateDestroyAPIView's default put
        return super().put(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # Soft delete (archive)
            instance.ce_is_archive = True
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

class CouncilSchedulingRestoreView(generics.UpdateAPIView):
    queryset = CouncilScheduling.objects.filter(ce_is_archive=True)
    serializer_class = CouncilSchedulingSerializer
    lookup_field = 'ce_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.ce_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

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
    def get_queryset(self):
        queryset = CouncilAttendance.objects.all()
        archived = self.request.query_params.get('archived')
        if archived is not None:
            archived = archived.lower() == 'true'
            queryset = queryset.filter(att_is_archive=archived)
        return queryset

class AttendeesBulkView(generics.GenericAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilAttendees.objects.all()

    def post(self, request, *args, **kwargs):
        ce_id = request.data.get('ce_id')
        logger.debug(f"Received data: {request.data}")
        if not ce_id:
            return Response({"detail": "ce_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch the CouncilScheduling instance
        council_scheduling = get_object_or_404(CouncilScheduling, pk=ce_id)
        
        # Delete existing attendees for this ce_id
        CouncilAttendees.objects.filter(ce_id=council_scheduling).delete()
        
        # Create new attendees
        attendees_data = request.data.get('attendees', [])
        if not attendees_data:
            return Response({"detail": "attendees array is required and cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=attendees_data, many=True)
        if serializer.is_valid():
            serializer.save(ce_id=council_scheduling)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response({"detail": "Invalid data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)   

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
            
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            # Soft delete (archive)
            instance.att_is_archive = True
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)

class RestoreAttendanceView(generics.UpdateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        if not instance.att_is_archive:
            return Response(
                {"detail": "Attendance sheet is not archived."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.att_is_archive = False
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
