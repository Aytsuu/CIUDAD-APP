# views.py
from rest_framework import generics, permissions
from .serializers import ComplaintSerializer
from apps.profiling.models import Address
from apps.file.models import File
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Complainant, Accused, Complaint, Complaint_File, ComplaintAccused
import json
import logging
from rest_framework.decorators import api_view, permission_classes

logger = logging.getLogger(__name__)

class ComplaintCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        try:
            # Parse JSON data from FormData
            complainant_data = json.loads(request.data.get('complainant', '{}'))
            accused_list = json.loads(request.data.get('accused', '[]'))
            media_files = json.loads(request.data.get('media_files', '[]')) 
            
            # Process complainant
            address_data = complainant_data.get('address', {})
            
            complainant_address = Address.objects.create(
                add_province=address_data.get('add_province', ''),
                add_city=address_data.get('add_city', ''),
                add_barangay=address_data.get('add_barangay', ''),
                add_street=address_data.get('add_street', ''),
                add_external_sitio=address_data.get('add_external_sitio', ''),
                sitio_id=address_data.get('sitio')
            )
            
            complainant = Complainant.objects.create(
                cpnt_name=complainant_data.get('name', ''),
                add=complainant_address
            )
            
            # Create single complaint
            complaint = Complaint.objects.create(
                comp_incident_type=request.data.get('incident_type', ''),
                comp_datetime=request.data.get('datetime', ''),
                comp_allegation=request.data.get('allegation', ''),
                cpnt=complainant
            )
            
            # Process accused persons
            for accused_data in accused_list:
                accused_address_data = accused_data.get('address', {})
                accused_address = Address.objects.create(
                    add_province=accused_address_data.get('add_province', ''),
                    add_city=accused_address_data.get('add_city', ''),
                    add_barangay=accused_address_data.get('add_barangay', ''),
                    add_street=accused_address_data.get('add_street', ''),
                    add_external_sitio=accused_address_data.get('add_external_sitio', ''),
                    sitio_id=accused_address_data.get('sitio')
                )
                
                accused = Accused.objects.create(
                    acsd_name=accused_data.get('name', ''),
                    add=accused_address
                )
                
                ComplaintAccused.objects.create(
                    comp=complaint,
                    acsd=accused
                )
            
            # Process media files from Supabase URLs
            for file_info in media_files:
                new_file = File.objects.create(
                    file_name=file_info['original_name'],
                    file_type=file_info['file_type'],
                    file_path=file_info['file_url'],  # Store the Supabase URL
                    file_url=file_info['file_url']    # Store the public URL
                )
                
                Complaint_File.objects.create(
                    comp=complaint,
                    file=new_file
                )
            
            return Response({
                'comp_id': complaint.comp_id,
                'status': 'success',
                'message': 'Complaint created successfully with multiple accused persons'
            }, status=status.HTTP_201_CREATED)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return Response({
                'error': f'Invalid JSON data: {str(e)}',
                'status': 'error'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating complaint: {str(e)}", exc_info=True)
            return Response({
                'error': str(e),
                'status': 'error',
                'details': 'Check server logs for more information'
            }, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [permissions.IsAuthenticated]
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