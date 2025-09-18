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
from apps.profiling.models import ResidentProfile, PersonalAddress, Personal
from apps.administration.models import Staff
from utils.supabase_client import upload_to_storage
from django.db.models import Q, F, ExpressionWrapper, fields
from django.db.models.functions import ExtractYear, Now
from datetime import date

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
            
            # Handle rp_id conversion for complainants
            for c_data in complainants_data:
                rp_id = c_data.get("rp_id")
                if rp_id and rp_id != "null" and rp_id != "undefined":
                    try:
                        resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
                        c_data["rp_id"] = resident_profile
                    except ResidentProfile.DoesNotExist:
                        logger.warning(f"ResidentProfile with ID {rp_id} not found")
                        c_data["rp_id"] = None
                else:
                    c_data["rp_id"] = None
                
                if not c_data.get("cpnt_address"):
                    c_data["cpnt_address"] = "N/A"

            # Parse accused safely
            accused_data = request.data.get("accused_persons", [])
            if isinstance(accused_data, str):
                try:
                    accused_data = json.loads(accused_data)
                except json.JSONDecodeError:
                    accused_data = []
            
            # Handle rp_id conversion for accused
            for a_data in accused_data:
                rp_id = a_data.get("rp_id")
                if rp_id and rp_id != "null" and rp_id != "undefined":
                    try:
                        resident_profile = ResidentProfile.objects.get(rp_id=rp_id)
                        a_data["rp_id"] = resident_profile
                    except ResidentProfile.DoesNotExist:
                        logger.warning(f"ResidentProfile with ID {rp_id} not found")
                        a_data["rp_id"] = None
                else:
                    a_data["rp_id"] = None
                
                if not a_data.get("acsd_address"):
                    a_data["acsd_address"] = "N/A"

            # Extract main complaint data
            complaint_data = {
                "comp_incident_type": request.data.get("comp_incident_type"),
                "comp_location": request.data.get("comp_location"),
                "comp_datetime": request.data.get("comp_datetime"),
                "comp_allegation": request.data.get("comp_allegation"),
            }

            # Add staff_id if provided
            if request.data.get("staff_id"):
                try:
                    staff_instance = Staff.objects.get(staff_id=request.data["staff_id"])
                    complaint_data["staff_id"] = staff_instance.pk
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
                
                # Create complainants and establish relationships
                complainant_instances = []
                for c_data in complainants_data:
                    # Create complainant
                    complainant = Complainant.objects.create(
                        cpnt_name=c_data.get("cpnt_name"),
                        cpnt_gender=c_data.get("cpnt_gender"),
                        cpnt_age=c_data.get("cpnt_age"),
                        cpnt_number=c_data.get("cpnt_number"),
                        cpnt_relation_to_respondent=c_data.get("cpnt_relation_to_respondent"),
                        cpnt_address=c_data.get("cpnt_address", "N/A"),
                        rp_id=c_data.get("rp_id")  # This is now a ResidentProfile instance or None
                    )
                    complainant_instances.append(complainant)
                
                # Create accused and establish relationships
                accused_instances = []
                for a_data in accused_data:
                    # Create accused
                    accused = Accused.objects.create(
                        acsd_name=a_data.get("acsd_name"),
                        acsd_age=a_data.get("acsd_age"),
                        acsd_gender=a_data.get("acsd_gender"),
                        acsd_description=a_data.get("acsd_description"),
                        acsd_address=a_data.get("acsd_address", "N/A"),
                        rp_id=a_data.get("rp_id")  # This is now a ResidentProfile instance or None
                    )
                    accused_instances.append(accused)
                
                # Create many-to-many relationships
                if complainant_instances:
                    complaint_complainants = [
                        ComplaintComplainant(comp=complaint, cpnt=complainant)
                        for complainant in complainant_instances
                    ]
                    ComplaintComplainant.objects.bulk_create(complaint_complainants)
                
                if accused_instances:
                    complaint_accused = [
                        ComplaintAccused(comp=complaint, acsd=accused)
                        for accused in accused_instances
                    ]
                    ComplaintAccused.objects.bulk_create(complaint_accused)
                
                # Handle file uploads
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

                # Serialize response with related data
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
        print(f"SearchComplainantsView called with query: '{query}'")
        
        if not query:
            return Response([])

        try:
            # Calculate age from date of birth
            current_year = date.today().year
            age_expression = ExpressionWrapper(
                current_year - ExtractYear('per__per_dob'),
                output_field=fields.IntegerField()
            )
            
            # Search in ResidentProfile with related personal info
            residents = (
                ResidentProfile.objects
                .select_related('per')
                .annotate(age=age_expression)
                .filter(
                    Q(per__per_lname__icontains=query) |
                    Q(per__per_fname__icontains=query) |
                    Q(per__per_mname__icontains=query) |
                    Q(per__per_contact__icontains=query) |
                    Q(rp_id__icontains=query)
                )[:10]
            )
            print(f"Found {residents.count()} residents")
            
        except Exception as e:
            print(f"Error querying residents: {e}")
            return Response([])

        results = []
        for resident in residents:
            try:
                person = resident.per
                if person:
                    # Get address from PersonalAddress relationship if available
                    address_parts = []
                    try:
                        # Try to get address from PersonalAddress
                        personal_address = PersonalAddress.objects.filter(per=person).first()
                        if personal_address and personal_address.add:
                            address = personal_address.add
                            address_parts = [
                                address.add_street,
                                address.add_barangay,
                                address.add_city,
                                address.add_province
                            ]
                    except PersonalAddress.DoesNotExist:
                        pass
                    
                    # If no address found, use empty values
                    if not address_parts:
                        address_parts = ["", "", "", ""]
                    
                    # Build full name
                    name_parts = [person.per_fname]
                    if person.per_mname:
                        name_parts.append(person.per_mname)
                    name_parts.append(person.per_lname)
                    if person.per_suffix:
                        name_parts.append(person.per_suffix)
                    
                    full_name = " ".join(name_parts).strip()
                    
                    # Calculate age from date of birth
                    today = date.today()
                    age = today.year - person.per_dob.year
                    if (today.month, today.day) < (person.per_dob.month, person.per_dob.day):
                        age -= 1
                    
                    result = {
                        "id": resident.rp_id,
                        "rp_id": resident.rp_id,
                        
                        # For display in search results
                        "cpnt_name": full_name,
                        "cpnt_gender": person.per_sex or "Unknown",
                        "cpnt_age": str(age),
                        "cpnt_number": person.per_contact or "",
                        "cpnt_address": ", ".join(filter(None, address_parts)),
                        "cpnt_relation_to_respondent": "",  # Default empty
                        
                        # For selectResidentComplainant function
                        "full_name": full_name,
                        "gender": person.per_sex or "Unknown",
                        "age": str(age),
                        "contact_number": person.per_contact or "",
                        "address": ", ".join(filter(None, address_parts)),
                    }
                    results.append(result)
                    
                    print(f"Resident data: {result}")
                
            except Exception as e:
                print(f"Error processing resident {resident.rp_id}: {e}")
                continue
        
        print(f"Returning {len(results)} results")
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

            # Update the complaint status to "Raised"
            Complaint.objects.filter(comp_id=comp_id).update(comp_status="Raised")
            logger.info(f"Updated complaint status to 'Raised': {comp_id}")

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
                'message': 'Service charge request created successfully',
                'comp_status': 'Raised'
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
            
            
class AllResidentsView(APIView):
    def get(self, request):
        try:
            # Get all residents with their personal info and addresses
            residents = (
                ResidentProfile.objects
                .select_related('per')
                .prefetch_related('per__personal_addresses__add')
                .all()[:100]  # Limit to 100 for performance
            )
            
            results = []
            for resident in residents:
                try:
                    person = resident.per
                    if not person:
                        continue
                    
                    # Get address
                    address_parts = []
                    try:
                        personal_address = PersonalAddress.objects.filter(per=person).first()
                        if personal_address and personal_address.add:
                            address = personal_address.add
                            address_parts = [
                                address.add_street,
                                address.add_barangay,
                                address.add_city,
                                address.add_province
                            ]
                    except PersonalAddress.DoesNotExist:
                        pass
                    
                    # Build full name
                    name_parts = [person.per_fname]
                    if person.per_mname:
                        name_parts.append(person.per_mname)
                    name_parts.append(person.per_lname)
                    if person.per_suffix:
                        name_parts.append(person.per_suffix)
                    
                    full_name = " ".join(name_parts).strip()
                    
                    # Calculate age from date of birth
                    today = date.today()
                    age = today.year - person.per_dob.year
                    if (today.month, today.day) < (person.per_dob.month, person.per_dob.day):
                        age -= 1
                    
                    result = {
                        "id": resident.rp_id,
                        "rp_id": resident.rp_id,
                        "cpnt_name": full_name,
                        "cpnt_gender": person.per_sex or "Unknown",
                        "cpnt_age": str(age),
                        "cpnt_number": person.per_contact or "",
                        "cpnt_address": ", ".join(filter(None, address_parts)),
                        "cpnt_relation_to_respondent": "",
                    }
                    results.append(result)
                    
                except Exception as e:
                    print(f"Error processing resident {resident.rp_id}: {e}")
                    continue
            
            return Response(results)
            
        except Exception as e:
            print(f"Error fetching all residents: {e}")
            return Response([], status=500)