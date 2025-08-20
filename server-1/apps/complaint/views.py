from rest_framework import generics, permissions
from .serializers import ComplaintSerializer
from apps.profiling.models import Address
from apps.profiling.models import Sitio
from apps.file.models import File
from apps.clerk.models import ServiceChargeRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import *
from .models import *
from apps.notification.models import Notification
import json
import logging
from rest_framework.decorators import api_view, permission_classes
from utils.supabase_client import supabase
from django.db import transaction
from django.utils import timezone
import uuid
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

class ComplaintCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _create_file_records(self, complaint, uploaded_files_data):
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
            complainant_data_list = json.loads(request.data.get('complainant', '[]'))
            accused_list = json.loads(request.data.get('accused', '[]'))
            uploaded_files_data = json.loads(request.data.get('uploaded_files', '[]'))

            print(f"Received {len(uploaded_files_data)} uploaded file URLs")
            for i, file_data in enumerate(uploaded_files_data):
                print(f"File {i}: {file_data.get('name')}, URL: {file_data.get('publicUrl')}")

            complaint = self._create_complaint(request)

            for complainant_data in complainant_data_list:
                complainant = self._create_complainant(complainant_data)
                # Use the through model
                ComplaintComplainant.objects.create(comp=complaint, cpnt=complainant)

            self._create_accused(complaint, accused_list)

            created_files = []
            if uploaded_files_data:
                try:
                    created_files = self._create_file_records(complaint, uploaded_files_data)
                except Exception as file_error:
                    logger.error(f"Failed to create file records: {str(file_error)}")

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

    def _create_complaint(self, request):
        return Complaint.objects.create(
            comp_incident_type=request.data.get('incident_type'),
            comp_datetime=request.data.get('datetime'),
            comp_location=request.data.get('location'),
            comp_allegation=request.data.get('allegation')
        )

    def _create_complainant(self, complainant_data):
        address_data = complainant_data.get('address', {})
        sitio_id = address_data.pop('sitio', None)
        sitio_instance = None

        if sitio_id:
            try:
                sitio_instance = Sitio.objects.get(sitio_id=sitio_id)
            except Sitio.DoesNotExist:
                address_data['add_external_sitio'] = sitio_id

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
            cpnt_gender=complainant_data.get('gender'),
            cpnt_age=complainant_data.get('age'),
            cpnt_number=complainant_data.get('contactNumber'),
            cpnt_relation_to_respondent=complainant_data.get('relation_to_respondent'),
            add=address
        )

        return complainant

    def _create_accused(self, complaint, accused_list):
        for accused_data in accused_list:
            address_data = accused_data.get('address', {})
            sitio_id = address_data.pop('sitio', None)
            sitio_instance = None

            if sitio_id:
                try:
                    sitio_instance = Sitio.objects.get(sitio_id=sitio_id)
                except Sitio.DoesNotExist:
                    address_data['add_external_sitio'] = sitio_id

            address = Address.objects.create(
                add_province=address_data.get('province'),
                add_city=address_data.get('city'),
                add_barangay=address_data.get('barangay'),
                add_street=address_data.get('street'),
                add_external_sitio=address_data.get('add_external_sitio'),
                sitio=sitio_instance
            )

            accused = Accused.objects.create(
                acsd_name=accused_data.get('alias'),
                acsd_age=accused_data.get('age'),
                acsd_gender=accused_data.get('gender'),
                acsd_description=accused_data.get('description'),
                add=address
            )

            ComplaintAccused.objects.create(comp=complaint, acsd=accused)

class ComplaintListView(generics.ListAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        try:
            return Complaint.objects.prefetch_related(
                # Prefetch complainants through the intermediate model
                'complaintcomplainant_set__cpnt__add',
                'complaintcomplainant_set__cpnt__add__sitio',
                
                # Prefetch accused through the intermediate model
                'complaintaccused_set__acsd__add',
                'complaintaccused_set__acsd__add__sitio',
                
                # Prefetch complaint files
                'complaint_file'
            ).order_by('-comp_created_at')
        except Exception as e:
            logger.error(f"Error in ComplaintListView queryset: {str(e)}")
            return Complaint.objects.none()

    def list(self, request, *args, **kwargs):
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
    lookup_field = 'comp_id'

    def get_queryset(self):
        return Complaint.objects.prefetch_related(
            'complaintcomplainant_set__cpnt__add',
            'complaintcomplainant_set__cpnt__add__sitio',
            
            'complaintaccused_set__acsd__add',
            'complaintaccused_set__acsd__add__sitio',
            
            'complaint_file'
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


@api_view(['GET'])
def search_complainants(request):
    query = request.GET.get('q', '')
    if not query:
        return Response([])
    
    complainants = Complainant.objects.filter(
        Q(cpnt_name__icontains=query) |
        Q(cpnt_number__icontains=query) |
        Q(add__add_barangay__icontains=query) |
        Q(add__add_city__icontains=query) |
        Q(add__add_province__icontains=query)
    ).select_related('add', 'add__sitio')[:10]  # Limit to 10 results
    
    results = []
    for c in complainants:
        results.append({
            'id': c.cpnt_id,
            'cpnt_name': c.cpnt_name,
            'cpnt_gender': c.cpnt_gender,
            'cpnt_age': c.cpnt_age,
            'cpnt_number': c.cpnt_number,
            'cpnt_relation_to_respondent': c.cpnt_relation_to_respondent,
            'add': {
                'add_province': c.add.add_province,
                'add_city': c.add.add_city,
                'add_barangay': c.add.add_barangay,
                'add_street': c.add.add_street,
                'sitio': {
                    'sitio_name': c.add.sitio.sitio_name if c.add.sitio else None
                },
                'add_external_sitio': c.add.add_external_sitio
            }
        })
    
    return Response(results)

@api_view(['GET'])
def search_accused(request):
    query = request.GET.get('q', '')
    print("Query Params:", request.GET)

    if not query:
        return Response([])
    
    accused = Accused.objects.filter(
        Q(acsd_name__icontains=query) |
        Q(acsd_description__icontains=query) |
        Q(add__add_barangay__icontains=query) |
        Q(add__add_city__icontains=query) |
        Q(add__add_province__icontains=query)
    ).select_related('add', 'add__sitio')[:10]  # Limit to 10 results
    
    results = []
    for a in accused:
        results.append({
            'id': a.acsd_id,
            'acsd_name': a.acsd_name,
            'acsd_age': a.acsd_age,
            'acsd_gender': a.acsd_gender,
            'acsd_description': a.acsd_description,
            'add': {
                'add_province': a.add.add_province,
                'add_city': a.add.add_city,
                'add_barangay': a.add.add_barangay,
                'add_street': a.add.add_street,
                'sitio': {
                    'sitio_name': a.add.sitio.sitio_name if a.add.sitio else None
                },
                'add_external_sitio': a.add.add_external_sitio
            }
        })
    
    return Response(results)

class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)

            case_id = f"{complaint.comp_id:03}"
            year_suffix = timezone.now().year % 100
            sr_code = f"{case_id}-{year_suffix:02}"
            
            service_request = ServiceChargeRequest.objects.create(
                comp=complaint,
                sr_code=sr_code,
                sr_status="Ongoing", 
                sr_type="Summon",
                sr_payment_status="Unpaid"
            )

            return Response({
                'sr_id': service_request.sr_id,
                'sr_code': service_request.sr_code,
                'status': 'success',
                'message': 'Service charge request created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
           return Response({'error': 'Complaint not found'}, status=404)