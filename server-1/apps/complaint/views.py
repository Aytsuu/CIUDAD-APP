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
            
            # Get media files - handle both File objects and URLs
            media_files = request.FILES.getlist('media_files')  # For File objects
            media_urls = request.data.getlist('media_urls', [])  # For URLs
            
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
                comp_category=request.data.get('category', 'Normal'),
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
            
            # Process media files (File objects)
            for file_obj in media_files:
                file_name = file_obj.name
                file_type = file_name.split('.')[-1].lower()
                
                # Map file extension to type
                if file_type in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                    file_type = 'image'
                elif file_type in ['mp4', 'mov', 'avi', 'webm']:
                    file_type = 'video'
                elif file_type == 'pdf':
                    file_type = 'pdf'
                else:
                    file_type = 'document'
                
                # Save file to your storage and get URL
                # (Implement your file storage logic here)
                file_url = f"/media/{file_name}"  # Example URL
                
                new_file = File.objects.create(
                    file_name=file_name,
                    file_type=file_type,
                    file_path=file_url,
                    file_url=file_url
                )
                
                Complaint_File.objects.create(
                    comp=complaint,
                    file=new_file
                )
            
            # Process media URLs
            for file_url in media_urls:
                if not file_url:
                    continue
                    
                file_name = file_url.split('/')[-1].split('?')[0]
                file_type = file_name.split('.')[-1].lower()
                
                # Map file extension to type
                if file_type in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                    file_type = 'image'
                elif file_type in ['mp4', 'mov', 'avi', 'webm']:
                    file_type = 'video'
                elif file_type == 'pdf':
                    file_type = 'pdf'
                else:
                    file_type = 'document'
                
                new_file = File.objects.create(
                    file_name=file_name,
                    file_type=file_type,
                    file_path=file_url,
                    file_url=file_url
                )
                
                Complaint_File.objects.create(
                    comp=complaint,
                    file=new_file
                )
            
            return Response({
                'comp_id': complaint.comp_id,
                'status': 'success',
                'message': 'Complaint created successfully'
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