# STEP 1: First, try this exact implementation
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from django.db.models.functions import TruncMonth
from apps.childhealthservices.models import ChildHealthrecord
from apps.childhealthservices.serializers import ChildHealthrecordSerializer
from ..utils import *




class MonthlyNewChildrenCountAPIView(APIView):
    """
    API View to get monthly counts of child health records
    Returns months with record counts based on created_at field
    """
    
    def get(self, request):
        try:
            # Get year filter if provided
            year = request.GET.get('year', '').strip()
            
            # Query to get monthly counts
            queryset = ChildHealthrecord.objects.all()
            
            if year:
                queryset = queryset.filter(created_at__year=year)
            
            monthly_counts = (
                queryset
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('chrec_id'))
                .order_by('-month')
            )
            
            # Format the response
            formatted_data = []
            for item in monthly_counts:
                formatted_data.append({
                    'year': item['month'].year,
                    'month': item['month'].month,
                    'month_name': item['month'].strftime('%B'),
                    'year_month': item['month'].strftime('%Y-%m'),
                    'count': item['count']
                })
            
            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
            
class MonthlyChildrenDetailAPIView(APIView):
    """
    Alternative implementation using kwargs and ChildHealthrecordSerializer
    """
    
    def get(self, request, *args, **kwargs):
        try:
            month = kwargs.get('month')
            print(f"DEBUG ALT: kwargs = {kwargs}")
            print(f"DEBUG ALT: month from kwargs = {month}")
            
            if not month:
                return Response({
                    'success': False,
                    'error': 'Month parameter is required in URL'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse month parameter
            year_str, month_str = month.split('-')
            year = int(year_str)
            month_num = int(month_str)
            
            # Calculate date range for the month
            start_date = datetime(year, month_num, 1)
            if month_num == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month_num + 1, 1)
            
            # Get child health records for the month with related data
            queryset = ChildHealthrecord.objects.filter(
                created_at__gte=start_date,
                created_at__lt=end_date
            ).select_related(
                'patrec', 
                'patrec__pat_id', 
                'patrec__pat_id__rp_id', 
                'patrec__pat_id__rp_id__per', 
                'patrec__pat_id__trans_id'
            ).order_by('-created_at')
            
            # Extract detailed information for each child
            formatted_data = []
            for record in queryset:
                patrec = record.patrec
                pat = patrec.pat_id if patrec else None
                
                if not pat:
                    continue
                
                # Get child name
                child_name = self._get_child_name(pat)
                
                # Get sex and date of birth
                sex, dob = self._get_sex_and_dob(pat)
                
                # Calculate age in months
                age_in_months = self._calculate_age_in_months(dob, record.created_at)
                
                # Get household number
                household_no = self._get_household_no(pat)
                
                # Get parents information
                parents = self._get_parents_info(pat)
                
                # Get address and sitio
                address, sitio = self._get_address_and_sitio(pat)
                
            
                # Format the data
                child_info = {
                    'record_id': record.chrec_id,
                    'created_at': record.created_at,
                    'household_no': household_no,
                    'child_name': child_name,
                    'sex': sex,
                    'date_of_birth': dob,
                    'age_in_months': age_in_months,
                    'parents': parents,
                    'address': address,
                    'sitio': sitio,
                  
                }
                
                formatted_data.append(child_info)
            
            return Response({
                'success': True,
                'month': month,
                'total_records': len(formatted_data),
                'records': formatted_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"DEBUG ALT: Error: {e}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_child_name(self, pat_obj):
        """Get child name based on patient type"""
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
            per = pat_obj.rp_id.per
            return f"{per.per_fname} {per.per_mname} {per.per_lname}".strip()
        elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
            trans = pat_obj.trans_id
            return f"{trans.tran_fname} {trans.tran_mname} {trans.tran_lname}".strip()
        return "Unknown"
    
    def _get_sex_and_dob(self, pat_obj):
        """Get sex and date of birth based on patient type"""
        sex = None
        dob = None
        
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
            per = pat_obj.rp_id.per
            sex = per.per_sex
            dob = per.per_dob
        elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
            trans = pat_obj.trans_id
            sex = trans.tran_sex
            dob = trans.tran_dob
            
        return sex, dob
    
    def _calculate_age_in_months(self, dob, reference_date):
        """
        Calculate age in months based on date of birth and reference date
        """
        try:
            if not dob or not reference_date:
                return 0
            
            # Convert reference_date to date if it's datetime
            if hasattr(reference_date, 'date'):
                reference_date = reference_date.date()
            
            # Convert dob to date if it's datetime
            if hasattr(dob, 'date'):
                dob = dob.date()
                
            # Calculate age in months
            age_months = (reference_date.year - dob.year) * 12 + (reference_date.month - dob.month)
            
            # Adjust if the day hasn't been reached yet in the current month
            if reference_date.day < dob.day:
                age_months -= 1
                
            return max(0, age_months)
            
        except (AttributeError, TypeError, ValueError) as e:
            print(f"Error calculating age: {e}")
            return 0
    
    def _get_household_no(self, pat_obj):
        """
        Get household number for a patient based on the reference PatientSerializer logic
        """
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
            try:
                # Get the most recent family composition for this resident
                current_composition = FamilyComposition.objects.filter(
                    rp=pat_obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    return str(current_composition.fam_id.fam_no) if hasattr(current_composition.fam_id, 'fam_no') else 'N/A'
            except Exception as e:
                print(f"Error fetching household number for resident {pat_obj.rp_id.rp_id}: {str(e)}")
        
        return 'N/A'

    def _get_parents_info(self, pat_obj):
        """
        Get parents information for a patient based on the reference PatientSerializer logic
        """
        parents = {}
        
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
            try:
                # Get family head info similar to PatientSerializer
                current_composition = FamilyComposition.objects.filter(
                    rp=pat_obj.rp_id
                ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
                
                if current_composition:
                    fam_id = current_composition.fam_id
                    
                    # Get all family members in the same family
                    family_compositions = FamilyComposition.objects.filter(
                        fam_id=fam_id
                    ).select_related('rp', 'rp__per')
                    
                    for composition in family_compositions:
                        role = composition.fc_role.lower()
                        if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                            personal = composition.rp.per
                            parents[role] = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
            except Exception as e:
                print(f"Error fetching parents info for resident {pat_obj.rp_id.rp_id}: {str(e)}")
        
        elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
            trans = pat_obj.trans_id
            if trans.mother_fname or trans.mother_lname:
                parents['mother'] = f"{trans.mother_fname} {trans.mother_mname} {trans.mother_lname}".strip()
            
            if trans.father_fname or trans.father_lname:
                parents['father'] = f"{trans.father_fname} {trans.father_mname} {trans.father_lname}".strip()
        
        return parents
    
    def _get_address_and_sitio(self, pat_obj):
        """
        Get address and sitio information for a patient
        """
        address = "N/A"
        sitio = "N/A"
        
        try:
            if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
                per = pat_obj.rp_id.per
                
                # Try to get address from database
                personal_address = PersonalAddress.objects.filter(
                    per=per
                ).select_related('add', 'add__sitio').first()
                
                if personal_address and personal_address.add:
                    address = personal_address.add.add_street or "N/A"
                    if personal_address.add.sitio:
                        sitio = personal_address.add.sitio.sitio_name or "N/A"
            
            elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
                trans = pat_obj.trans_id
                if hasattr(trans, 'tradd_id') and trans.tradd_id:
                    address = trans.tradd_id.tradd_street or "N/A"
                    sitio = trans.tradd_id.tradd_sitio or "N/A"
        
        except Exception as e:
            print(f"Error fetching address for patient {pat_obj.pat_id}: {str(e)}")
        
        return address, sitio