from rest_framework import serializers
from .models import *
from apps.administration.serializers.staff_serializers import StaffBaseSerializer,StaffFullSerializer,StaffTableSerializer
from apps.patientrecords.serializers.patients_serializers import PatientRecordSerializer,PatientSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializerBase
from apps.patientrecords.serializers.bodymesurement_serializers import ChildrenBodyMeasurementBaseSerializer,BodyMeasurementSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.vaccination.serializers import VaccinationHistorySerializerBase
from apps.medicineservices.serializers import *

class ChildHealthrecordSerializerBase(serializers.ModelSerializer):
    class Meta:
        model = ChildHealthrecord
        fields = '__all__'
        
class ChildHealthrecordSerializer(serializers.ModelSerializer):
    patrec_details = PatientRecordChildrenSerializer(source='patrec', read_only=True)
    latest_child_history_date = serializers.SerializerMethodField()
    
    class Meta:
        model = ChildHealthrecord
        fields = '__all__'

    def get_latest_child_history_date(self, obj):
        # Get the most recent child health history date for this record
        latest_history = ChildHealth_History.objects.filter(
            chrec=obj
        ).order_by('-created_at').first()
        
        if latest_history and latest_history.created_at:
            return latest_history.created_at
        return None

class ChildHealthHistorySerializerBase(serializers.ModelSerializer):
    class Meta:
        model = ChildHealth_History
        fields = '__all__'

class ChildHealthHistorySerializer(serializers.ModelSerializer):
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)

    class Meta:
        model = ChildHealth_History
        fields = '__all__'


class LatestVitalBMSerializer(serializers.Serializer):
    chvital_id = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    
    # Body Measurement fields
    height = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()
    wfa = serializers.CharField(source='bm.wfa')

    def get_height(self, obj):
        height = obj.bm.height
        return int(height) if height % 1 == 0 else height

    def get_weight(self, obj):
        weight = obj.bm.weight
        return int(weight) if weight % 1 == 0 else weight
    lhfa = serializers.CharField(source='bm.lhfa')
    wfl = serializers.CharField(source='bm.wfl')
    muac = serializers.CharField(source='bm.muac')
    muac_status = serializers.CharField(source='bm.muac_status')
    edemaSeverity = serializers.CharField(source='bm.edemaSeverity')
    bm_remarks = serializers.CharField(source='bm.remarks')
    is_opt = serializers.BooleanField(source='bm.is_opt')
    bm_created_at = serializers.DateTimeField(source='bm.created_at')
    
    # Vital Signs fields
    vital_temp = serializers.CharField(source='vital.vital_temp')
    vital_created_at = serializers.DateTimeField(source='vital.created_at')
     
   
class ChildHealthNotesBaseSerializer(serializers.ModelSerializer):
    followv_details = FollowUpVisitSerializerBase(source='followv', read_only=True)
    class Meta:
            model = ChildHealthNotes
            fields = '__all__'
        
class ChildHealthNotesSerializer(serializers.ModelSerializer):
    chhist_details = ChildHealthHistorySerializerBase(source='chhist', read_only=True)
    followv_details = FollowUpVisitSerializerBase(source='followv', read_only=True)
    staff_details = StaffTableSerializer(source='staff', read_only=True)
    
    # Add history field
    history = serializers.SerializerMethodField()
    
    class Meta:
        model = ChildHealthNotes
        fields = '__all__'  # or list your specific fields and add 'history'
       
    
    def get_history(self, obj):
        """Get history records for this note"""
        history_qs = obj.history.all()[:10]  # Get last 10 history records
        
        history_data = []
        for h in history_qs:
            history_data.append({
                'history_id': h.history_id,
                'history_date': h.history_date,
                'history_type': h.history_type,
                'history_change_reason': getattr(h, 'history_change_reason', None),
                'chn_notes': h.chn_notes,
                'created_at': h.created_at,
                'updated_at': h.updated_at,
                # Include staff info if available in history
                'staff_name': f"{h.staff.rp.per.per_fname} {h.staff.rp.per.per_lname}" if h.staff and h.staff.rp and h.staff.rp.per else None,
                'staff_id': h.staff.staff_id if h.staff else None,
            })
        
        return history_data

    class Meta:
        model = ChildHealthNotes
        fields = '__all__'

class ChildHealthSupplementsSerializer(serializers.ModelSerializer):
    # Get all medicine items with their quantities for this request
    medreqitem_details = serializers.SerializerMethodField()

    class Meta: 
        model = ChildHealthSupplements
        fields = '__all__'

    def get_medreqitem_details(self, obj):
        """Get all medicine request items with their allocations and quantities"""
        if not obj.medreq:
            return []
        
        # Get all items for this medicine request
        items = MedicineRequestItem.objects.filter(medreq_id=obj.medreq)
        
        medicine_data = []
        for item in items:
            # Sum all allocations for this specific medreqitem
            allocations = MedicineAllocation.objects.filter(medreqitem=item)
            total_quantity = allocations.aggregate(total=models.Sum('allocated_qty'))['total'] or 0
            
            # Get medicine details
            medicine_details = None
            if item.med:
                medicine_details = {
                    'med_id': item.med.med_id,
                    'med_name': item.med.med_name,
                    'med_dsg': item.med.med_dsg,
                    'med_dsg_unit': item.med.med_dsg_unit,
                    'med_form': item.med.med_form,
                }
            
            # Get the unit from the first allocation (if there are multiple)
            display_unit = None
            first_allocation = allocations.first()
            if first_allocation and first_allocation.minv:
                display_unit = self._get_display_unit(first_allocation.minv.minv_qty_unit)
            
            # Get allocation details
            allocation_details = []
            for allocation in allocations:
                if allocation.minv:
                    allocation_details.append({
                        'alloc_id': allocation.alloc_id,
                        'minv_id': allocation.minv.minv_id,
                        'allocated_qty': allocation.allocated_qty,
                        'unit': self._get_display_unit(allocation.minv.minv_qty_unit),
                    })
            
            medicine_data.append({
                'medreqitem_id': item.medreqitem_id,
                'medicine': medicine_details,
                'reason': item.reason,
                'status': item.status,
                'total_quantity': total_quantity,
                'unit': display_unit,  # Add unit here from first allocation
                'allocations': allocation_details,
                'created_at': item.created_at,
                'action_by': StaffTableSerializer(item.action_by).data if item.action_by else None,
            })
        
        return medicine_data

    def _get_display_unit(self, minv_qty_unit):
        """Convert minv_qty_unit to display unit"""
        if not minv_qty_unit:
            return None
        
        # Convert to lowercase for case-insensitive comparison
        unit_lower = minv_qty_unit.lower().strip()
        
        # If unit is "boxes", return "pc/s"
        if unit_lower in ['boxes', 'box']:
            return 'pc/s'
        
        # Otherwise return the original unit
        return minv_qty_unit
    

class ChildHealthSupplementStatusSerializer(serializers.ModelSerializer):
    # chsupp_details = ChildHealthSupplementsSerializer(source='chsupplement', read_only=True)
    
    class Meta:
        model = ChildHealthSupplementsStatus
        fields = '__all__'
    



class ChildHealthVitalSignsSerializer(serializers.ModelSerializer):
    find_details = FindingSerializer(source='find', read_only=True)
    bm_details = ChildrenBodyMeasurementBaseSerializer(source='bm', read_only=True)
    temp = serializers.CharField(source='vital.vital_temp', read_only=True)
    class Meta:
        model = ChildHealthVitalSigns
        fields = '__all__'
        
        
class ChildHealthVitalSignsSerializerFull(serializers.ModelSerializer):
    find_details = FindingSerializer(source='find', read_only=True)
    bm_details = ChildrenBodyMeasurementBaseSerializer(source='bm', read_only=True)

    class Meta:
        model = ChildHealthVitalSigns
        fields = '__all__'  # or list explicitly

   

class ExclusiveBFCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExclusiveBFCheck
        fields = '__all__'


class ChildHealthImmunizationHistorySerializer(serializers.ModelSerializer):
    vachist_details = VaccinationHistorySerializerBase(source='vachist', read_only=True)

    class Meta:
        model = ChildHealthImmunizationHistory
        fields = '__all__'

class ChildHealthMinimalSerializer(serializers.ModelSerializer):
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)
    child_health_vital_signs = ChildHealthVitalSignsSerializer(many=True, read_only=True)

    class Meta:
        model = ChildHealth_History
        fields = [
            'chhist_id',            
            'created_at',
            'tt_status',
            'status',
            'chrec',
            'chrec_details',
            'child_health_vital_signs',
            'index',
        ]


class ChildHealthHistoryFullSerializer(serializers.ModelSerializer):
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)
    child_health_notes = ChildHealthNotesSerializer(many=True, read_only=True)
    child_health_vital_signs = ChildHealthVitalSignsSerializer(many=True, read_only=True)
    child_health_supplements = ChildHealthSupplementsSerializer(many=True, read_only=True)
    exclusive_bf_checks = ExclusiveBFCheckSerializer(many=True, read_only=True)
    immunization_tracking = ChildHealthImmunizationHistorySerializer(many=True, read_only=True)
    supplements_statuses =ChildHealthSupplementStatusSerializer(many=True, read_only=True)
    index = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChildHealth_History
        fields = [
            'chhist_id',            
            'created_at',
            'tt_status',
            'status',
            'chrec',
            'chrec_details',
            'child_health_notes',
            'child_health_vital_signs',
            'child_health_supplements',
            'exclusive_bf_checks',
            'immunization_tracking',
            'supplements_statuses',
            'index',
        ]



  
class ChildHealthrecordSerializerFull(serializers.ModelSerializer):
    child_health_histories = ChildHealthHistoryFullSerializer(many=True, read_only=True)
    class Meta:
        model = ChildHealthrecord
        fields = "__all__"
        
        
class OPTTrackingSerializer(serializers.ModelSerializer):
    vital_signs = ChildHealthVitalSignsSerializerFull(source='*', read_only=True)
    chist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)
    
    class Meta:
        model = ChildHealthVitalSigns
        fields = ['vital_signs', 'chist_details']

