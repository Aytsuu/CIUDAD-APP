from rest_framework import generics, permissions
from .serializers import ComplaintSerializer
from apps.profiling.models import Address
from apps.profiling.models import Sitio
from apps.file.models import File
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import *
from apps.notification.models import Notification
import json
import logging
from rest_framework.decorators import api_view, permission_classes
from utils.supabase_client import supabase
from django.db import transaction
import uuid
logger = logging.getLogger(__name__)


class ComplaintCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    # permission_classes = [permissions.IsAuthenticated]
    
    def _create_file_records(self, complaint, uploaded_files_data):
        """Create file records from uploaded Supabase URLs"""
        try:
            created_files = []
            
            for file_data in uploaded_files_data:
                complaint_file = Complaint_File.objects.create(
                    comp_file_name=file_data.get('name'),
                    comp_file_type=file_data.get('type', 'document'),
                    comp_file_path=file_data.get('publicUrl'),
                    supabase_path=file_data.get('storagePath'),
                    file_size=file_data.get('size', 0),
                    comp=complaint
                )
                created_files.append(complaint_file)
                print(f"File record created: {complaint_file.comp_file_id}")
            
            return created_files
            
        except Exception as e:
            logger.error(f"Error creating file records: {str(e)}")
            raise Exception(f"File record creation failed: {str(e)}")
        
    @transaction.atomic
    def post(self, request):
        try:
            complainant_data = json.loads(request.data.get('complainant', '{}'))
            accused_list = json.loads(request.data.get('accused', '[]'))
            uploaded_files_data = json.loads(request.data.get('uploaded_files', '[]'))
            
            print(f"Received {len(uploaded_files_data)} uploaded file URLs")
            for i, file_data in enumerate(uploaded_files_data):
                print(f"File {i}: {file_data.get('name')}, URL: {file_data.get('publicUrl')}")

            # Create complaint and related objects
            complaint = self._create_complaint(request, complainant_data)
            self._create_accused(complaint, accused_list)
            
            # Create file records from uploaded URLs
            created_files = []
            if uploaded_files_data:
                try:
                    created_files = self._create_file_records(complaint, uploaded_files_data)
                except Exception as file_error:
                    logger.error(f"Failed to create file records: {str(file_error)}")
                    # You might want to decide whether to fail the entire complaint or continue
                    pass

            return Response({
                'comp_id': complaint.comp_id,
                'status': 'success',
                'message': 'Complaint created successfully',
                'created_files': len(created_files),
                'total_files': len(uploaded_files_data)
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating complaint: {str(e)}")
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_400_BAD_REQUEST)

    def _create_complaint(self, request, complainant_data):
        address_data = complainant_data.get('address', {})
        
        # Handle sitio field properly
        sitio_id = address_data.pop('sitio', None)
        sitio_instance = None
        
        if sitio_id:
            try:
                sitio_instance = Sitio.objects.get(sitio_id=sitio_id)
            except Sitio.DoesNotExist:
                address_data['add_external_sitio'] = sitio_id
        
        # Create address with proper field names
        address = Address.objects.create(
            add_province=address_data.get('province'),
            add_city=address_data.get('city'),
            add_barangay=address_data.get('barangay'),
            add_street=address_data.get('street'),
            add_external_sitio=address_data.get('add_external_sitio'),
            sitio=sitio_instance
        )
        
        complainant = Complainant.objects.create(
            cpnt_name=complainant_data.get('name'),
            add=address
        )
        
        return Complaint.objects.create(
            comp_incident_type=request.data.get('incident_type'),
            comp_datetime=request.data.get('datetime'),
            comp_allegation=request.data.get('allegation'),
            comp_category=request.data.get('category', 'Normal'),
            cpnt=complainant
        )

    def _create_accused(self, complaint, accused_list):
        for accused_data in accused_list:
            address_data = accused_data.get('address', {})
            
            # Handle sitio field properly
            sitio_id = address_data.pop('sitio', None)
            sitio_instance = None
            
            if sitio_id:
                try:
                    sitio_instance = Sitio.objects.get(sitio_id=sitio_id)
                except Sitio.DoesNotExist:
                    # Handle case where sitio doesn't exist
                    address_data['add_external_sitio'] = sitio_id
            
            # Create address with proper field names
            address = Address.objects.create(
                add_province=address_data.get('province'),
                add_city=address_data.get('city'),
                add_barangay=address_data.get('barangay'),
                add_street=address_data.get('street'),
                add_external_sitio=address_data.get('add_external_sitio'),
                sitio=sitio_instance
            )
            
            accused = Accused.objects.create(
                acsd_name=accused_data.get('name'),
                add=address
            )
            ComplaintAccused.objects.create(comp=complaint, acsd=accused)
    
            
class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer
    # permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            return Complaint.objects.select_related(
                'cpnt', 
                'cpnt__add'
            ).prefetch_related(
                'complaintaccused_set__acsd__add',
            ).order_by('-comp_created_at')
        except Exception as e:
            logger.error(f"Error in ComplaintListView queryset: {str(e)}")
            return Complaint.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list method to add error handling"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in ComplaintListView list: {str(e)}")
            return Response({
                'error': 'An error occurred while fetching complaints',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ComplaintSerializer
    # permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'comp_id'
    
    def get_queryset(self):
        """Optimize queryset for detail view"""
        return Complaint.objects.select_related(
            'cpnt', 
            'cpnt__add'
        ).prefetch_related(
            'complaintaccused_set__acsd__add',
        )

    def perform_update(self, serializer):
        serializer.save()

@api_view(['PATCH'])
def archive_complaint(request, pk):
    try:
        complaint = Complaint.objects.get(pk=pk)
        complaint.comp_is_archive = True
        complaint.save()
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
    except Complaint.DoesNotExist:
        return Response(
            {"error": "Complaint not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def archived_complaints(request):
    try:
        complaints = Complaint.objects.filter(comp_is_archive=True)
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
def restore_complaint(request, pk):
    try:
        complaint = Complaint.objects.get(pk=pk, comp_is_archive=True)
        complaint.comp_is_archive = False
        complaint.save()
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
    except Complaint.DoesNotExist:
        return Response(
            {"error": "Archived complaint not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        