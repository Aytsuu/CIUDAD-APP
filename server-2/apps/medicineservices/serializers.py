from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.models import *
from apps.inventory.serializers.medicine_serializers import *
from apps.reports.serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage


# ALL  medicine RECORD 
class PatientMedicineRecordSerializer(serializers.ModelSerializer):
    medicine_count = serializers.SerializerMethodField()
    patient_details = PatientSerializer(source='*', read_only=True)
    
    class Meta:
        model = Patient
        fields = "__all__"

    def get_medicine_count(self, obj):
        count = MedicineRecord.objects.filter(
            patrec_id__pat_id=obj.pat_id
        ).count()
        print(f"medicine count for patient {obj.pat_id} with status RECORDED: {count}")
        return count

class MedicineRecordSerialzer(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv_id', read_only=True)
    patrec_details = PatientRecordSerializer(source='patrec_id', read_only=True)
    class Meta:
        model = MedicineRecord
        fields = '__all__'

class MedicineRecordSerializerMinimal(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv_id', read_only=True)
    class Meta:
        model = MedicineRecord
        fields = '__all__'
        
class MedicineRequestSerializer(serializers.ModelSerializer):
    address = serializers.SerializerMethodField()
    personal_info = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()  # Add this field

    def get_total_quantity(self, obj):
        """Calculate total quantity of all items in this request"""
        return obj.items.aggregate(
            total=models.Sum('medreqitem_qty')
        )['total'] or 0
        
    def get_rp(self, obj):
        # Try to get ResidentProfile through pat_id if it exists
        try:
            if obj.pat_id and hasattr(obj.pat_id, 'rp_id'):
                return obj.pat_id.rp_id
        except Exception as e:
            print("⚠️ pat_id not available:", e)

        # Fallback if rp_id is directly available
        return getattr(obj, 'rp_id', None)

    def get_personal_info(self, obj):
        # Handle resident patient
        if obj.pat_id and obj.pat_id.pat_type == 'Resident' and obj.pat_id.rp_id and hasattr(obj.pat_id.rp_id, 'per'):
            personal = obj.pat_id.rp_id.per
            return PersonalSerializer(personal, context=self.context).data
        
        # Handle transient patient
        if obj.pat_id and obj.pat_id.pat_type == 'Transient' and obj.pat_id.trans_id:
            trans = obj.pat_id.trans_id
            return {
                'per_fname': trans.tran_fname,
                'per_lname': trans.tran_lname,
                'per_mname': trans.tran_mname,
                'per_suffix': trans.tran_suffix,
                'per_dob': trans.tran_dob,
                'per_sex': trans.tran_sex,
                'per_status': trans.tran_status,
                'per_edAttainment': trans.tran_ed_attainment,
                'per_religion': trans.tran_religion,
                'per_contact': trans.tran_contact,
            }
        return None

    def get_address(self, obj):
        rp = self.get_rp(obj)
        if not rp or not hasattr(rp, 'per'):
            return None

        # Check PersonalAddress
        personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=rp.per).first()
        if personal_address and personal_address.add:
            address = personal_address.add
            sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
            return {
                'add_street': address.add_street,
                'add_barangay': address.add_barangay,
                'add_city': address.add_city,
                'add_province': address.add_province,
                'sitio': sitio,
                'full_address': f"{sitio}, {address.add_barangay}, {address.add_city}, {address.add_province}, {address.add_street}"
            }

        # Fallback to Household address
        household = Household.objects.select_related('add', 'add__sitio').filter(rp=rp).first()
        if household and household.add:
            address = household.add
            sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
            return {
                'add_street': address.add_street,
                'add_barangay': address.add_barangay,
                'add_city': address.add_city,
                'add_province': address.add_province,
                'sitio': sitio,
                'full_address': f"{sitio}, {address.add_barangay}, {address.add_city}, {address.add_province}, {address.add_street}"
            }

        return None
    
    

    class Meta:
        model = MedicineRequest
        fields = '__all__'


class MedicineRequestItemSerializer(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv_id', read_only=True)
    medreq_details = MedicineRequestSerializer(source='medreq_id', read_only=True)
    
    class Meta:
        model = MedicineRequestItem
        fields = '__all__'
    
    
class FindingPlanTreatmentSerializer(serializers.ModelSerializer):
    medreq_details = MedicineRequestSerializer(source='medreq', read_only=True)

    class Meta:
        model = FindingsPlanTreatment
        fields = '__all__'
        
class MedicineFileSerializer(serializers.ModelSerializer):
    medrec_details = MedicineRecordSerialzer(source='medrec', read_only=True)

    class Meta:
        model = Medicine_File
        fields = '__all__'
        read_only_fields = ('medf_id', 'created_at', 'medf_url')
        
class MedicineFileCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, required=False, many=True)

    class Meta:
        model = Medicine_File
        fields = '__all__'
        
    @transaction.atomic
    def create(self, validated_data):
        files_data = validated_data.pop('files', [])
        if not files_data:
            raise serializers.ValidationError({"files": "At least one file must be provided"})
            
        medrec_id = validated_data.pop('medrec', None)
        
        if not medrec_id :
            raise serializers.ValidationError("Either medrec or medreq must be provided")
            
        created_files = self._upload_files(files_data, medrec_id)

        if not created_files:
            raise serializers.ValidationError("Failed to upload files")

        return created_files[0]

    def _upload_files(self, files_data, medrec_id):
        med_files = []
        for file_data in files_data:
            med_file = Medicine_File(
                medf_name=file_data['name'],
                medf_type=file_data['type'],
                medf_path=file_data['name'],
                created_at=timezone.now(),
                medrec_id=medrec_id,
            )

            url = upload_to_storage(file_data['file'], 'medicine-bucket')
            med_file.ief_url = url
            med_files.append(med_file)

        if med_files:
            return Medicine_File.objects.bulk_create(med_files)
        return []
