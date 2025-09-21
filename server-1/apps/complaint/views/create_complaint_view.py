# Rest Framework imports
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# Local imports
from apps.complaint.models import Complaint, Complainant, Accused, ComplaintComplainant, ComplaintAccused, Complaint_File
from apps.complaint.serializers import ComplaintSerializer
from apps.profiling.models import ResidentProfile, PersonalAddress, Personal
from apps.administration.models import Staff
# from apps.complaint.serializers.create_complaint_serializer import ComplaintSerializer

# Django imports
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse

# Utility imports
from utils.supabase_client import upload_to_storage

# Python imports
import json
import logging

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
            accused_data = request.data.get("accused", [])
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

# class ComplaintCreateView(APIView):
    
#     @transaction.atomic
#     def post(self, request, *args, **kwargs):
#         try: 
#             logger.infO(f"Received comlaint creation request")
            
#             serializer = ComplaintSerializer(data=request.data)

#             if serializer.is_valid():
#                 complaint = serializer.save()
#                 logger.info(f"Complaint created: {complaint.comp_id}")
                
#                 return Response({serializer.data}, status=status.HTTP_201_CREATED)
#             return Response({"error": "Invalid data provided",  "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST )    
#         except Exception as e:
#             logger.error(f"Error creating complaint: {str(e)}")
#             return Response({"error": "An unexpected error occurred", "detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)