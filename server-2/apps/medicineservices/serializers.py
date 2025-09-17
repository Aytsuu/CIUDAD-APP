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
class MedicineRecordCreateSerializer(serializers.ModelSerializer):
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
    pat_type = serializers.SerializerMethodField()
    pat_id_value = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    total_confirmed=serializers.SerializerMethodField()
    class Meta:
        model = MedicineRequest
        fields = '__all__'

    def get_total_quantity(self, obj):
         return MedicineRequestItem.objects.filter(
            medreq_id=obj.medreq_id,
            status='pending'
        ).count()
    def get_total_confirmed(self, obj):
         return MedicineRequestItem.objects.filter(
            medreq_id=obj.medreq_id,
            status='confirmed'
        ).count()

    def get_pat_type(self, obj):
        """Get patient type"""
        try:
            if obj.pat_id:
                return obj.pat_id.pat_type
            elif obj.rp_id:
                return 'Resident'
        except Exception as e:
            print(f"Error getting patient type: {str(e)}")
        return None

    def get_pat_id_value(self, obj):
        """Get patient ID value"""
        try:
            if obj.pat_id:
                return obj.pat_id.pat_id
            elif obj.rp_id:
                return f"RES_{obj.rp_id.rp_id}"
        except Exception as e:
            print(f"Error getting patient ID: {str(e)}")
        return None

    def get_personal_info(self, obj):
        """Get personal information using the same pattern as PatientSerializer"""
        try:
            # Handle resident through pat_id
            if obj.pat_id and obj.pat_id.pat_type == 'Resident' and obj.pat_id.rp_id and hasattr(obj.pat_id.rp_id, 'per'):
                personal = obj.pat_id.rp_id.per
                return {
                    'per_fname': personal.per_fname,
                    'per_lname': personal.per_lname,
                    'per_mname': personal.per_mname,
                    'per_suffix': personal.per_suffix,
                    'per_dob': personal.per_dob,
                    'per_sex': personal.per_sex,
                    'per_status': personal.per_status,
                    'per_edAttainment': personal.per_edAttainment,
                    'per_religion': personal.per_religion,
                    'per_contact': personal.per_contact,
                }
            
            # Handle resident through direct rp_id
            elif obj.rp_id and hasattr(obj.rp_id, 'per'):
                personal = obj.rp_id.per
                return {
                    'per_fname': personal.per_fname,
                    'per_lname': personal.per_lname,
                    'per_mname': personal.per_mname,
                    'per_suffix': personal.per_suffix,
                    'per_dob': personal.per_dob,
                    'per_sex': personal.per_sex,
                    'per_status': personal.per_status,
                    'per_edAttainment': personal.per_edAttainment,
                    'per_religion': personal.per_religion,
                    'per_contact': personal.per_contact,
                }
            
            # Handle transient patient
            elif obj.pat_id and obj.pat_id.pat_type == 'Transient' and obj.pat_id.trans_id:
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
                
        except Exception as e:
            print(f"Error getting personal info: {str(e)}")
        return None

    def get_address(self, obj):
        """Get address using the same pattern as PatientSerializer"""
        try:
            # Handle resident through pat_id
            if obj.pat_id and obj.pat_id.pat_type == 'Resident' and obj.pat_id.rp_id:
                return self._get_resident_address(obj.pat_id.rp_id)
            
            # Handle resident through direct rp_id
            elif obj.rp_id:
                return self._get_resident_address(obj.rp_id)
            
            # Handle transient patient
            elif obj.pat_id and obj.pat_id.pat_type == 'Transient' and obj.pat_id.trans_id:
                return self._get_transient_address(obj.pat_id.trans_id)
                
        except Exception as e:
            print(f"Error getting address: {str(e)}")
        return None

    def _get_resident_address(self, rp):
        """Get address for resident with proper formatting"""
        try:
            # Check PersonalAddress first
            personal_address = PersonalAddress.objects.select_related('add', 'add__sitio').filter(per=rp.per).first()
            if personal_address and personal_address.add:
                address = personal_address.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }

            # Fallback to Household address
            household = Household.objects.select_related('add', 'add__sitio').filter(rp=rp).first()
            if household and household.add:
                address = household.add
                sitio = address.sitio.sitio_name if address.sitio else address.add_external_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
                    address.add_barangay if address.add_barangay else None,
                    address.add_city if address.add_city else None,
                    address.add_province if address.add_province else None,
                    address.add_street if address.add_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': address.add_street,
                    'add_barangay': address.add_barangay,
                    'add_city': address.add_city,
                    'add_province': address.add_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
                
        except Exception as e:
            print(f"Error getting resident address: {str(e)}")
        return None

    def _get_transient_address(self, trans):
        """Get address for transient with proper formatting"""
        try:
            if trans.tradd_id:
                trans_addr = trans.tradd_id
                sitio = trans_addr.tradd_sitio
                # Construct full address dynamically based on available fields
                address_parts = [
                    f"Sitio {sitio}" if sitio else None,
                    trans_addr.tradd_barangay if trans_addr.tradd_barangay else None,
                    trans_addr.tradd_city if trans_addr.tradd_city else None,
                    trans_addr.tradd_province if trans_addr.tradd_province else None,
                    trans_addr.tradd_street if trans_addr.tradd_street else None,
                ]
                # Filter out None values and join with ", "
                full_address = ", ".join(filter(None, address_parts))
                return {
                    'add_street': trans_addr.tradd_street,
                    'add_barangay': trans_addr.tradd_barangay,
                    'add_city': trans_addr.tradd_city,
                    'add_province': trans_addr.tradd_province,
                    'add_sitio': sitio,
                    'full_address': full_address
                }
        except Exception as e:
            print(f"Error getting transient address: {str(e)}")
        return None

    
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
        

class MedicineRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineRecord
        fields = '__all__'
      
      
class MedicineRequestItemSerializer(serializers.ModelSerializer):
    minv_details = MedicineInventorySerializer(source='minv_id', read_only=True)
    medreq_details = MedicineRequestSerializer(source='medreq_id', read_only=True)
    med_details=MedicineListSerializers(source='med', read_only=True)
    medicine_files = MedicineFileSerializer(source='medreq_id.medicine_files', many=True, read_only=True)
    
    class Meta:
        model = MedicineRequestItem
        fields = '__all__'
     
class Medicine_FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine_File
        fields = '__all__'
        extra_kwargs = {
            'medrec': {'required': False, 'default': None},
            'medreq': {'required': False, 'default': None},
            'medf_url': {'read_only': True},
            'medf_path': {'read_only': True},
        }
    
    def _upload_files(self, files, medrec_instance=None, medreq_instance=None):
        """Upload multiple files for medicine record or request item"""
        if not medrec_instance and not medreq_instance:
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
                medrec=medrec_instance,
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