# council/views.py (unchanged)
from rest_framework import generics
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from datetime import datetime
from rest_framework.permissions import AllowAny
import logging
from apps.treasurer.models import Purpose_And_Rates
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.exceptions import NotFound


logger = logging.getLogger(__name__)

class UpdateTemplateByPrIdView(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        old_id = request.data.get("old_pr_id")
        new_id = request.data.get("new_pr_id")
        
        try:
            new_purpose_rate = get_object_or_404(Purpose_And_Rates, pk=new_id)
            templates = Template.objects.filter(pr_id=old_id)
            
            updated_count = templates.update(pr_id=new_purpose_rate)  # More efficient bulk update
            
            return Response({
                "status": "updated",
                "count": updated_count,
                "message": f"Updated {updated_count} template(s)"
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

class AttendanceSheetListView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    
    def get_queryset(self):
        queryset = super().get_queryset()
        ce_id = self.request.query_params.get('ce_id')
        archive_status = self.request.query_params.get('archive')
        
        if ce_id:
            queryset = queryset.filter(ce_id=ce_id)
            
        if archive_status == 'true':
            queryset = queryset.filter(att_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(att_is_archive=False)
            
        return queryset

class AttendanceSheetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Add file deletion logic if needed
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            instance.att_is_archive = True
            instance.save()
            return Response({"message": "Attendance sheet archived"}, 
                          status=status.HTTP_200_OK)

class RestoreAttendanceView(generics.UpdateAPIView):
    queryset = CouncilAttendance.objects.filter(att_is_archive=True)
    serializer_class = CouncilAttendanceSerializer
    lookup_field = 'att_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.att_is_archive = False
        instance.save()
        return Response({"message": "Attendance sheet restored"},
                      status=status.HTTP_200_OK)

class StaffAttendanceRankingView(generics.ListAPIView):
    serializer_class = StaffAttendanceRankingSerializer

    def get_queryset(self):
        # Aggregate present attendees by atn_name for non-archived events
        current_year = datetime.now().year
        return (
            CouncilAttendees.objects
            .filter(
                atn_present_or_absent='Present',
                ce_id__ce_is_archive=False,
                ce_id__ce_date__year=current_year,
            )
            .values('atn_name', 'atn_designation')
            .annotate(attendance_count=Count('atn_id'))
            .order_by('-attendance_count')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
    queryset = Template.objects.all()


class SummonTemplateView(APIView):
    def get(self, request):
        filename = request.query_params.get('filename')
        if not filename:
            raise NotFound("Missing 'filename' parameter")

        try:
            template = Template.objects.get(temp_filename=filename, temp_is_archive=False)
        except Template.DoesNotExist:
            raise NotFound("Template not found")

        serializer = TemplateSerializer(template)
        return Response(serializer.data)

#UPDATE TEMPLATE
class UpdateTemplateView(generics.RetrieveUpdateAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()
    lookup_field = 'temp_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#DELETE TEMPLATE
class DeleteTemplateView(generics.DestroyAPIView):
    serializer_class = TemplateSerializer    
    queryset = Template.objects.all()

    def get_object(self):
        temp_id = self.kwargs.get('temp_id')
        return get_object_or_404(Template, temp_id=temp_id) 



class DeleteTemplateByPrIdView(generics.DestroyAPIView):
    serializer_class = TemplateSerializer
    queryset = Template.objects.all()

    def delete(self, request, *args, **kwargs):
        pr_id = kwargs.get('pr_id')
        deleted_count, _ = Template.objects.filter(pr_id=pr_id).delete()
        
        if deleted_count == 0:
            return Response(
                {"detail": "No templates found with this pr_id."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


 # =================================  RESOLUTION =================================

class ResolutionView(generics.ListCreateAPIView):
    serializer_class = ResolutionSerializer
    queryset = Resolution.objects.all()


class DeleteResolutionView(generics.DestroyAPIView):
    serializer_class = ResolutionSerializer    
    queryset = Resolution.objects.all()

    def get_object(self):
        res_num = self.kwargs.get('res_num')
        return get_object_or_404(Resolution, res_num=res_num) 


class UpdateResolutionView(generics.RetrieveUpdateAPIView):
    serializer_class = ResolutionSerializer
    queryset = Resolution.objects.all()
    lookup_field = 'res_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

 # RESOLUTION FILE
# class ResolutionFileView(generics.ListCreateAPIView):
#     serializer_class = ResolutionFileSerializer
#     queryset = ResolutionFile.objects.all()


class ResolutionFileView(generics.ListCreateAPIView):
    serializer_class = ResolutionFileSerializer
    queryset = ResolutionFile.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        res_num = self.request.query_params.get('res_num')
        if res_num:
            queryset = queryset.filter(res_num=res_num)
        return queryset

    def create(self, request, *args, **kwargs):
        # Get res_num from either query params or request data
        res_num = request.query_params.get('res_num') or request.data.get('res_num')
        
        if not res_num:
            return Response(
                {"error": "res_num is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, res_num=res_num)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)    


# Deleting Res File or replace if updated
class ResolutionFileDetailView(generics.RetrieveDestroyAPIView):
    queryset = ResolutionFile.objects.all()
    serializer_class = ResolutionFileSerializer
    lookup_field = 'rf_id' 


 # Resolution Supp Docs
class ResolutionSupDocsView(generics.ListCreateAPIView):
    serializer_class = ResolutionSupDocsSerializer
    queryset = ResolutionSupDocs.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        res_num = self.request.query_params.get('res_num')
        if res_num:
            queryset = queryset.filter(res_num=res_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get res_num from either query params or request data
        res_num = request.query_params.get('res_num') or request.data.get('res_num')
        
        if not res_num:
            return Response(
                {"error": "res_num is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, res_num=res_num)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)      


class ResolutionSupDocsDetailView(generics.RetrieveDestroyAPIView):
    queryset = ResolutionSupDocs.objects.all()
    serializer_class = ResolutionSupDocsSerializer
    lookup_field = 'rsd_id'     


class PurposeRatesListView(generics.ListCreateAPIView):
    queryset = Purpose_And_Rates.objects.all()
    serializer_class = PurposeRatesListViewSerializer
    

class MinutesOfMeetingView(generics.ListCreateAPIView):
    serializer_class = MinutesOfMeetingSerializer
    queryset = MinutesOfMeeting.objects.all()

class MOMAreaOfFocusView(generics.ListCreateAPIView):
    serializer_class = MOMAreaOfFocusSerializer
    queryset = MOMAreaOfFocus.objects.all()

class MOMFileView(generics.ListCreateAPIView):
    serializer_class = MOMFileCreateSerializer
    queryset = MOMFile.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors) 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)

class UpdateMinutesOfMeetingView(generics.RetrieveUpdateAPIView):
    serializer_class = MinutesOfMeetingSerializer
    queryset = MinutesOfMeeting.objects.all()
    lookup_field = 'mom_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteMinutesOfMeetingView(generics.DestroyAPIView):
    serializer_class = MinutesOfMeetingSerializer    
    queryset = MinutesOfMeeting.objects.all()

    def get_object(self):
        mom_id = self.kwargs.get('mom_id')
        return get_object_or_404(MinutesOfMeeting, mom_id=mom_id) 
    

class UpdateMOMFileView(generics.RetrieveUpdateAPIView):
    serializer_class = MOMFileViewSerializer
    queryset = MOMFile.objects.all()
    lookup_field = 'momf_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DeleteMOMAreaOfFocusView(APIView):
    def delete(self, request, mom_id):
        get_object_or_404(MinutesOfMeeting, mom_id=mom_id)
        deleted_count, _ = MOMAreaOfFocus.objects.filter(mom_id=mom_id).delete()

        return Response(
            {"detail": f"{deleted_count} area(s) of focus deleted."},
            status=status.HTTP_204_NO_CONTENT
        )
    

class MOMSuppDocView(generics.ListCreateAPIView):
    serializer_class = MOMSuppDocSerializer
    query_set = MOMSuppDoc.objects.all()