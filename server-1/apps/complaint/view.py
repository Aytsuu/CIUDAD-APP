from rest_framework import generics, permissions
from .serializers import ComplaintSerializer
from apps.file.models import File
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
            
class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        try:
            queryset = Complaint.objects.prefetch_related(
                'complaintcomplainant_set__cpnt__rp_id',
                # 'complaintaccused_set__acsd__rp_id',
                'complaint_file',
                'staff'
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
            'staff'
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
        'staff'
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