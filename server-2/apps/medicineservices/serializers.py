from rest_framework import serializers
from .models import *
from datetime import date
from apps.inventory.serializers import *
from apps.patientrecords.models import *
from apps.patientrecords.serializers.patients_serializers import PatientSerializer, PatientRecordSerializer
from apps.healthProfiling.serializers.base import PersonalSerializer
from apps.healthProfiling.models import *
# serializers.py



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
