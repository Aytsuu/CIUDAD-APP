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
from datetime import date
from apps.profiling.models import ResidentProfile
from apps.administration.models import Staff
from utils.supabase_client import upload_to_storage

logger = logging.getLogger(__name__)

class ComplaintCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ComplaintSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Received data keys: {request.data.keys()}")

            # Parse complainants safely
            complainants_data = request.data.get("complainant", [])
            if isinstance(complainants_data, str):
                try:
                    complainants_data = json.loads(complainants_data)
                except json.JSONDecodeError:
                    complainants_data = []
            for c in complainants_data:
                if not c.get("cpnt_address"):
                    c["cpnt_address"] = "N/A"

            # Parse accused safely
            accused_data = request.data.get("accused_persons", [])
            if isinstance(accused_data, str):
                try:
                    accused_data = json.loads(accused_data)
                except json.JSONDecodeError:
                    accused_data = []
            for a in accused_data:
                if not a.get("acsd_address"):
                    a["acsd_address"] = "N/A"

            # Extract main complaint data
            complaint_data = {
                "comp_incident_type": request.data.get("comp_incident_type"),
                "comp_location": request.data.get("comp_location"),
                "comp_datetime": request.data.get("comp_datetime"),
                "comp_allegation": request.data.get("comp_allegation"),
                "complainant": complainants_data,
                "accused_persons": accused_data,
            }

            # Add staff_id if provided
            if request.data.get("staff_id"):
                try:
                    staff_instance = Staff.objects.get(staff_id=request.data["staff_id"])
                    complaint_data["staff_id"] = staff_instance
                except Staff.DoesNotExist:
                    logger.warning(f"Staff with ID {request.data['staff_id']} not found")

            # Validate required fields
            required_fields = [
                "comp_incident_type",
                "comp_location",
                "comp_datetime",
                "comp_allegation",
            ]
            missing_fields = [f for f in required_fields if not complaint_data.get(f)]

            if missing_fields:
                return Response(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Serialize complaint
            serializer = ComplaintSerializer(
                data=complaint_data, context={"request": request}
            )

            if serializer.is_valid():
                complaint = serializer.save()
                
                files = request.FILES.getlist("complaint_files")
                if files:
                    complaint_files = []
                    for file_data in files:
                        folder = "images" if file_data.content_type.split("/")[0] == "image" else "documents"

                        url = upload_to_storage(file_data, "complaint-bucket", folder)

                        complaint_file = Complaint_File(
                            comp=complaint,
                            comp_file_name=file_data.name,
                            comp_file_type=file_data.content_type,
                            comp_file_url=url,
                        )
                        complaint_files.append(complaint_file)

                    if complaint_files:
                        Complaint_File.objects.bulk_create(complaint_files)

                # Serialize response
                response_serializer = ComplaintSerializer(
                    complaint, context={"request": request}
                )
                logger.info(f"Successfully created complaint: {complaint.comp_id}")

                return Response(
                    response_serializer.data, status=status.HTTP_201_CREATED
                )
            else:
                logger.error(f"Serializer errors: {serializer.errors}")
                return Response(
                    {"error": "Invalid data provided", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return Response(
                {"error": "Invalid JSON data in request"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error in ComplaintCreateView: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        try:
            queryset = Complaint.objects.prefetch_related(
                'complaintcomplainant_set__cpnt__rp_id',
                # 'complaintaccused_set__acsd__rp_id',
                'complaint_file',
                'staff_id'
            ).filter(comp_is_archive=False).order_by('-comp_created_at')
            
            # we filter by comp_status
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(comp_status=status)
                
            return queryset
        
        except Exception as e:
            logger.error(f"Error in ComplaintListView queryset: {str(e)}")
            return Complaint.objects.none()
            
class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ComplaintSerializer
    lookup_field = 'comp_id'

    def get_queryset(self):
        return Complaint.objects.prefetch_related(
            'complaintcomplainant_set__cpnt',
            'complaintaccused_set__acsd',
            'complaint_file',
            'staff_id'
        )

    def perform_update(self, serializer):
        serializer.save()

        
class ArchiveComplaintView(APIView):

    def patch(self, request, pk):
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

class ArchivedComplaintsView(generics.ListAPIView):
    queryset = Complaint.objects.filter(comp_is_archive=True).prefetch_related(
        'complaintcomplainant_set__cpnt',
        'complaintaccused_set__acsd',
        'complaint_file',
        'staff_id'
    ).order_by('-comp_created_at')
    serializer_class = ComplaintSerializer
    
class RestoreComplaintView(APIView):

    def patch(self, request, pk):
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

class SearchComplainantsView(APIView):
    def get(self, request):
        query = request.GET.get("q", "")
        print(f"SearchComplainantsView called with query: '{query}'")  # Debug log
        
        if not query:
            return Response([])

        # Search in ResidentProfile using the per_id relationship
        try:
            residents = (
                ResidentProfile.objects.select_related('per').filter(
                    Q(per__per_lname__icontains=query)
                    | Q(per__per_fname__icontains=query)
                    | Q(per__per_mname__icontains=query)
                    | Q(per__per_contact__icontains=query)
                )[:10]
            )
            print(f"Found {residents.count()} residents")  # Debug log
        except Exception as e:
            print(f"Error querying residents: {e}")
            return Response([])
        

        results = []
        for r in residents:
            try:
                # Access personal info through the per_id relationship
                person = r.per
                if person:
                    full_name = f"{person.per_fname} {getattr(person, 'per_mname', '') or ''} {person.per_lname}".strip()
                    address = f"{getattr(person, 'per_purok', '') or ''}, {getattr(person, 'per_barangay', '') or ''}, {getattr(person, 'per_municipality', '') or ''}, {getattr(person, 'per_province', '') or ''}".strip(', ')
                    
                    result = {
                        "id": r.rp_id,  # For React key
                        "rp_id": r.rp_id,
                        
                        # For display in search results (matching your current frontend)
                        "cpnt_name": full_name,
                        "cpnt_gender": getattr(person, 'per_sex', 'Unknown'),
                        "cpnt_age": getattr(person, 'per_age', 0),
                        "cpnt_number": getattr(person, 'per_contact', '') or '',
                        "cpnt_address": address,
                        
                        # For selectResidentComplainant function (matching your current selection logic)
                        "full_name": full_name,
                        "gender": getattr(person, 'per_sex', 'Unknown'),
                        "age": getattr(person, 'per_age', 0),
                        "contact_number": getattr(person, 'per_contact', '') or '',
                        "address": address,
                    }
                    results.append(result)
                    
                    # Debug: print the actual data being returned
                    print(f"Resident data: {result}")
                
            except Exception as e:
                print(f"Error processing resident {r.rp_id}: {e}")
                continue
        
        print(f"Returning {len(results)} results")  # Debug log
        return Response(results)


class SearchAccusedView(APIView):
    def get(self, request):
        query = request.GET.get("q", "")
        print(f"SearchAccusedView called with query: '{query}'")  # Debug log
        
        if not query:
            return Response([])

        # Search in ResidentProfile using the per_id relationship
        try:
            residents = (
                ResidentProfile.objects.select_related('per').filter(
                    Q(per__per_lname__icontains=query)
                    | Q(per__per_fname__icontains=query)
                    | Q(per__per_mname__icontains=query)
                    | Q(per__per_contact__icontains=query)
                )[:10]
            )
            print(f"Found {residents.count()} accused residents")  # Debug log
        except Exception as e:
            print(f"Error querying accused residents: {e}")
            return Response([])

        results = []
        for r in residents:
            try:
                # Access personal info through the per_id relationship
                person = r.per
                if person:
                    full_name = f"{person.per_fname} {getattr(person, 'per_mname', '') or ''} {person.per_lname}".strip()
                    address = f"{getattr(person, 'per_purok', '') or ''}, {getattr(person, 'per_barangay', '') or ''}, {getattr(person, 'per_municipality', '') or ''}, {getattr(person, 'per_province', '') or ''}".strip(', ')
                    
                    result = {
                        "id": r.rp_id,  # For React key
                        "rp_id": r.rp_id,
                        
                        # For display in search results (different prefix for accused)
                        "acc_name": full_name,
                        "acc_gender": getattr(person, 'per_sex', 'Unknown'),
                        "acc_age": getattr(person, 'per_age', 0),
                        "acc_number": getattr(person, 'per_contact', '') or '',
                        "acc_address": address,
                        
                        # For selection function
                        "full_name": full_name,
                        "gender": getattr(person, 'per_sex', 'Unknown'),
                        "age": getattr(person, 'per_age', 0),
                        "contact_number": getattr(person, 'per_contact', '') or '',
                        "address": address,
                    }
                    results.append(result)
                    
                    # Debug: print the actual data being returned
                    print(f"Accused data: {result}")
                
            except Exception as e:
                print(f"Error processing accused resident {r.rp_id}: {e}")
                continue

        print(f"Returning {len(results)} accused results")  # Debug log
        return Response(results)

class ServiceChargeRequestCreateView(APIView):
    @transaction.atomic
    def post(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
            logger.info(f"Found complaint: {complaint.comp_id}")

            sr_count = ServiceChargeRequest.objects.count() + 1
            year_suffix = timezone.now().year % 100
            sr_id = f"SR{sr_count:03d}-{year_suffix:02d}"
            
            logger.info(f"Generated SR Code: {sr_id}")
            
            service_request = ServiceChargeRequest.objects.create(
                sr_id=sr_id,
                comp_id=complaint,
                sr_req_status="Pending", 
                sr_type="Summon",
                sr_case_status="Waiting for Schedule",
                sr_req_date=timezone.now()
            )
            
            logger.info(f"Created service request: {service_request.sr_id}")
            
            return Response({
                'sr_id': service_request.sr_id,
                'status': 'success',
                'message': 'Service charge request created successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Complaint.DoesNotExist:
            logger.error(f"Complaint not found: {comp_id}")
            return Response({
                'error': 'Complaint not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error creating service request: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)