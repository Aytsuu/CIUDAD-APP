from rest_framework import serializers
from .models import *
from apps.administration.serializers.staff_serializers import StaffBaseSerializer,StaffFullSerializer,StaffTableSerializer
from apps.patientrecords.serializers.patients_serializers import PatientRecordSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializerBase
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.medicineservices.serializers import MedicineRequestSerializer
from apps.vaccination.serializers import VaccinationRecordSerializer
from apps.patientrecords.serializers.disability_serializers import PatientDisablitySerializerBase
from apps.medicineservices.serializers import MedicineRecordSerializerMinimal


class ChildHealthrecordSerializerBase(serializers.ModelSerializer):
    class Meta:
        model = ChildHealthrecord
        fields = '__all__'
class ChildHealthrecordSerializer(serializers.ModelSerializer):
    # staff_details = StaffBaseSerializer(source='staff', read_only=True)
    patrec_details = PatientRecordSerializer(source='patrec', read_only=True)
    # staff_details = StaffFullSerializer(source='staff', read_only=True)

    class Meta:
        model = ChildHealthrecord
        fields = '__all__'


class ChildHealthHistorySerializerBase(serializers.ModelSerializer):
    class Meta:
        model = ChildHealth_History
        fields = '__all__'
class ChildHealthHistorySerializer(serializers.ModelSerializer):
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)

    class Meta:
        model = ChildHealth_History
        fields = '__all__'


class ChildHealthNotesSerializer(serializers.ModelSerializer):
    chhist_details = ChildHealthHistorySerializerBase(source='chhist', read_only=True)
    followv_details = FollowUpVisitSerializerBase(source='followv', read_only=True)
    staff_details = StaffFullSerializer(source='staff', read_only=True)

    class Meta:
        model = ChildHealthNotes
        fields = '__all__'

class ChildHealthVitalSignsSerializer(serializers.ModelSerializer):
    # vital_details = VitalSignsSerializer(source='vital', read_only=True)
    find_details = FindingSerializer(source='find', read_only=True)
    bm_details = BodyMeasurementSerializer(source='bm', read_only=True)
    # chhist_details = ChildHealthHistorySerializerBase(source='chhist', read_only=True)

    
    class Meta:
        model = ChildHealthVitalSigns
        fields = '__all__'
   

class ChildHealthSupplementsSerializer(serializers.ModelSerializer):
    medrec_details = MedicineRecordSerializerMinimal(source='medrec', read_only=True)

    class Meta: 
        model = ChildHealthSupplements
        fields = '__all__'

class ChildHealthSupplementStatusSerializer(serializers.ModelSerializer):
    # chsupp_details = ChildHealthSupplementsSerializer(source='chsupplement', read_only=True)
    
    class Meta:
        model = ChildHealthSupplementsStatus
        fields = '__all__'
    

class NutritionalStatusSerializer(serializers.ModelSerializer):
    # bm_details = BodyMeasurementSerializer(source='bm', read_only=True)
    # chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)
    # chvital_details = ChildHealthVitalSignsSerializer(source='chvital', read_only=True)
    class Meta:
        model = NutritionalStatus
        fields = '__all__'

class ChildHealthVitalSignsSerializer(serializers.ModelSerializer):
    find_details = FindingSerializer(source='find', read_only=True)
    bm_details = BodyMeasurementSerializer(source='bm', read_only=True)
    chnotes_details = ChildHealthNotesSerializer(source='chnotes', read_only=True)
    

    class Meta:
        model = ChildHealthVitalSigns
        fields = '__all__'
class ExclusiveBFCheckSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExclusiveBFCheck
        fields = '__all__'


class ChildHealthImmunizationHistorySerializer(serializers.ModelSerializer):
    vacrec_details = VaccinationRecordSerializer(source='vacrec', read_only=True)

    class Meta:
        model = ChildHealthImmunizationHistory
        fields = '__all__'

class ChildHealthHistoryFullSerializer(serializers.ModelSerializer):
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)
    
    child_health_notes = ChildHealthNotesSerializer(many=True, read_only=True)
    child_health_vital_signs = ChildHealthVitalSignsSerializer(many=True, read_only=True)
    child_health_supplements = ChildHealthSupplementsSerializer(many=True, read_only=True)
    exclusive_bf_checks = ExclusiveBFCheckSerializer(many=True, read_only=True)
    immunization_tracking = ChildHealthImmunizationHistorySerializer(many=True, read_only=True)
    supplements_statuses =ChildHealthSupplementStatusSerializer(many=True, read_only=True)
    nutrition_statuses = serializers.SerializerMethodField()
    disabilities = serializers.SerializerMethodField()  # 🔷 ADD THIS


    class Meta:
        model = ChildHealth_History
        fields = [
            'chhist_id',            
            'disabilities', 
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
            'nutrition_statuses',
        ]


    def get_nutrition_statuses(self, obj):
        # fetch nutritional status for each vital sign
        vitals = obj.child_health_vital_signs.all()
        nut_stats = []
        for vital in vitals:
            for nut in vital.nutritional_status.all():
                nut_stats.append(NutritionalStatusSerializer(nut).data)
        return nut_stats
    def get_disabilities(self, obj):  # 🔷 THIS METHOD
        patrec = obj.chrec.patrec
        disabilities = patrec.patient_disabilities.all()
        return PatientDisablitySerializerBase(disabilities, many=True).data

class ChildHealthrecordSerializerFull(serializers.ModelSerializer):
    child_health_histories = ChildHealthHistoryFullSerializer(many=True, read_only=True)
    class Meta:
        model = ChildHealthrecord
        fields = "__all__"
