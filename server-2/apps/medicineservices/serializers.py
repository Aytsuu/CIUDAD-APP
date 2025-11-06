from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.patients_serializers import *
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.models import *
from apps.inventory.serializers.medicine_serializers import *
from apps.reports.serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage
from apps.administration.serializers.staff_serializers import StaffTableSerializer
from apps.patientrecords.utils import *
from apps.medicineservices.models import *


class PatientMedicineRecordSerializer(serializers.ModelSerializer):
    medicine_count = serializers.SerializerMethodField()
    latest_medicine_date = serializers.SerializerMethodField()
    patient_details = PatientMiniMalSerializer(source='*', read_only=True)
    
    class Meta:
        model = Patient
        fields = "__all__"

    def get_medicine_count(self, obj):
        count = MedicineRequestItem.objects.filter(
            medreq_id__patrec__pat_id=obj.pat_id,
            status='completed'
        ).count()
        return count

    def get_latest_medicine_date(self, obj):
        """
        Get the most recent medicine record date for this patient based on fulfilled_at.
        """
        latest_medicine = MedicineRequest.objects.filter(
            patrec_id__pat_id=obj.pat_id
        ).order_by('-fulfilled_at').first()

        if latest_medicine and latest_medicine.fulfilled_at:
            return latest_medicine.fulfilled_at
        return None
    

class MedicineAllocationSerializer(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv', read_only=True)

    class Meta:
        model = MedicineAllocation
        fields ='__all__'
        
class MedicineFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicine_File
        fields = '__all__'
        read_only_fields = ('medf_id', 'created_at', 'medf_url')



class MedicineRequestBaseSerializer(serializers.ModelSerializer):
    
    class Meta:
        model =  MedicineRequest
        fields = '__all__'

class MedicineRecordMinimalSerialzer(serializers.ModelSerializer):
    med_details = MedicineListSerializers(source='med', read_only=True)
    completed_by_details = StaffTableSerializer(source='completed_by', read_only=True)
    action_by_details = StaffTableSerializer(source='action_by', read_only=True)
    unit= serializers.SerializerMethodField()
    medreq_details = MedicineRequestBaseSerializer(source='medreq_id', read_only=True)
    pat_id = serializers.SerializerMethodField()
    total_allocated_qty = serializers.SerializerMethodField()

    def get_total_allocated_qty(self, obj):
        # obj is a MedicineRequestItem instance
        total_qty = MedicineAllocation.objects.filter(
            medreqitem=obj
        ).aggregate(total=models.Sum('allocated_qty'))['total'] or 0
        return total_qty
    
    def get_unit(self, obj):
        # Get unit from the first allocation's minv_id if exists, else fallback to obj.minv_id
        allocation = MedicineAllocation.objects.filter(medreqitem=obj).first()
        if allocation and allocation.minv and allocation.minv.minv_qty_unit:
            return allocation.minv.minv_qty_unit
        if obj.minv_id and obj.minv_id.minv_qty_unit:
            return obj.minv_id.minv_qty_unit
        return None
    def get_pat_id(self, obj):
        patrec = getattr(obj.medreq_id, 'patrec', None)
        if patrec and hasattr(patrec, 'pat_id') and patrec.pat_id:
            return str(patrec.pat_id.pat_id)
        return None
    
    class Meta:
        model = MedicineRequestItem
        fields = '__all__'

class MedicineRecordSerialzer(serializers.ModelSerializer):
    med_details = MedicineListSerializers(source='med', read_only=True)
    completed_by_details = StaffTableSerializer(source='completed_by', read_only=True)
    action_by_details = StaffTableSerializer(source='action_by', read_only=True)
    total_allocated_qty = serializers.SerializerMethodField()
    medicine_files = MedicineFileSerializer(source='medreq_id.medicine_files', many=True, read_only=True)
    pat_details = serializers.SerializerMethodField()
    unit= serializers.SerializerMethodField()
    medreq_details = MedicineRequestBaseSerializer(source='medreq_id', read_only=True)
    index = serializers.IntegerField(read_only=True)
    
    def get_total_allocated_qty(self, obj):
        # obj is a MedicineRequestItem instance
        total_qty = MedicineAllocation.objects.filter(
            medreqitem=obj
        ).aggregate(total=models.Sum('allocated_qty'))['total'] or 0
        return total_qty

    def get_unit(self, obj):
        # Get unit from the first allocation's minv_id if exists, else fallback to obj.minv_id
        allocation = MedicineAllocation.objects.filter(medreqitem=obj).first()
        if allocation and allocation.minv and allocation.minv.minv_qty_unit:
            return allocation.minv.minv_qty_unit
        if obj.minv_id and obj.minv_id.minv_qty_unit:
            return obj.minv_id.minv_qty_unit
        return None

    def get_pat_details(self, obj):
        patrec = getattr(obj.medreq_id, 'patrec', None)
        if patrec and hasattr(patrec, 'pat_id') and patrec.pat_id:
            info = extract_personal_info(patrec.pat_id)
            addr = extract_address(patrec.pat_id)
            return {
                'personal_info': info if info is not None else {},
                'address': addr if addr is not None else {},
                'pat_id': patrec.pat_id.pat_id if hasattr(patrec.pat_id, 'pat_id') else None
            }
        return {
            'personal_info': {},
            'address': {},
            'pat_id': None
        }

    class Meta:
        model = MedicineRequestItem
        fields = '__all__'

        
class MedicineRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineRecord
        fields = '__all__'



    
class FindingPlanTreatmentSerializer(serializers.ModelSerializer):
    medreq_details = MedicineRecordSerialzer(source='medreq', read_only=True)

    class Meta:
        model = FindingsPlanTreatment
        fields = '__all__'

class MedicineRequestSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()
    personal_info = serializers.SerializerMethodField()
    pat_type = serializers.SerializerMethodField()
    pat_id_value = serializers.SerializerMethodField()
    pat_id = serializers.SerializerMethodField()

    class Meta:
        model = MedicineRequest
        fields = '__all__'

    def get_pat_type(self, obj):
        """Get patient type from rp_id or trans_id"""
        if obj.rp_id:
            return 'Resident'
        elif obj.trans_id:
            return 'Transient'
        return None
    def get_pat_id_value(self, obj):
        """Get patient ID value from rp_id or trans_id"""
        if obj.rp_id:
            return str(obj.rp_id.rp_id)
        elif obj.trans_id:
            return str(obj.trans_id.trans_id)
        return None
    def get_pat_id(self, obj):
        """
        Return the patient id via obj.patrec.pat_id if available.
        If not, get the Patient via rp_id or trans_id and return its pat_id.
        """
        patrec = getattr(obj, 'patrec', None)
        if patrec and getattr(patrec, 'pat_id', None):
            pat = patrec.pat_id
            if hasattr(pat, 'pat_id'):
                return str(pat.pat_id)
            return str(pat)
        # If no patrec, try to get Patient via rp_id or trans_id
        if obj.rp_id:
            patient = Patient.objects.filter(rp_id=obj.rp_id).first()
            if patient:
                return str(patient.pat_id)
        elif obj.trans_id:
            patient = Patient.objects.filter(trans_id=obj.trans_id).first()
            if patient:
                return str(patient.pat_id)
        return None

      
    def get_personal_info(self, obj):
        return extract_personal_info(obj)

    def get_address(self, obj):
        return extract_address(obj)
  
class MedicineRequestItemSerializer(serializers.ModelSerializer):
    medreq_details = MedicineRequestBaseSerializer(source='medreq_id', read_only=True)
    med_details = MedicineListSerializers(source='med', read_only=True)
    
    # FIX: Get medicine_files from the related MedicineRequest
    medicine_files = serializers.SerializerMethodField()
    
    # Add allocations details
    allocations = MedicineAllocationSerializer(many=True, read_only=True)
    
    # Add staff details
    action_by_details = StaffTableSerializer(source='action_by', read_only=True)
    completed_by_details = StaffTableSerializer(source='completed_by', read_only=True)
    
    # Add total allocated quantity
    total_allocated_qty = serializers.SerializerMethodField()

    def get_medicine_files(self, obj):
        """Get medicine files from the related MedicineRequest"""
        if obj.medreq_id and hasattr(obj.medreq_id, 'medicine_files'):
            return MedicineFileSerializer(obj.medreq_id.medicine_files.all(), many=True).data
        return []
    
    def get_total_allocated_qty(self, obj):
        """Calculate total allocated quantity from all allocations"""
        total_qty = MedicineAllocation.objects.filter(
            medreqitem=obj
        ).aggregate(total=models.Sum('allocated_qty'))['total'] or 0
        return total_qty

    class Meta:
        model = MedicineRequestItem
        fields = '__all__'
     
class Medicine_FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine_File
        fields = '__all__'
        extra_kwargs = {
            'medreq': {'required': False, 'default': None},
            'medf_url': {'read_only': True},
            'medf_path': {'read_only': True},
        }
    
    def _upload_files(self, files, medreq_instance=None):
        """Upload multiple files for medicine record or request item"""
        if  not medreq_instance:
            raise serializers.ValidationError({"error": "Either medrec_instance or medreq_instance is required"})
        
        med_files = []
        
        for file_data in files:
            # Validate file data (same as working version)
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                print(f"Skipping invalid file data: {file_data.get('name', 'unknown')}")
                continue
            
            # Create the Medicine_File instance FIRST (like the working version)
            med_file = Medicine_File(
                medf_name=file_data['name'],
                medf_type=file_data['type'],
                medf_path=f"medicine/{file_data['name']}",  # Fixed path format
                medreq=medreq_instance,
                created_at=timezone.now(),
            )
            
            # THEN upload to storage and assign the URL (like the working version)
            med_file.medf_url = upload_to_storage(file_data, 'medicine-document', 'medicine')
            
            med_files.append(med_file)
        
        # Save all files at once (like the working version)
        if med_files:
            Medicine_File.objects.bulk_create(med_files)
            print(f"Successfully created {len(med_files)} file records")
        else:
            print("No valid files to upload")
        
        return med_files