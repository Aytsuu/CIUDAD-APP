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
    chsupp_details = ChildHealthSupplementsSerializer(source='chsupplement', read_only=True)
    
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
    
    # Supplements statuses nested within supplements
    supplements_statuses =ChildHealthSupplementStatusSerializer(many=True, read_only=True)
    nutrition_statuses = serializers.SerializerMethodField()
    disabilities = serializers.SerializerMethodField()  # 🔷 ADD THIS


    class Meta:
        model = ChildHealth_History
        fields = [
            'chhist_id',            
            'disabilities',  # 🔷 INCLUDE HERE
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

    def get_supplements_statuses(self, obj):
        # fetch statuses for each supplement
        supplements = obj.child_health_supplements.all()
        statuses = []
        for supp in supplements:
            for stat in supp.statuses.all():
                statuses.append(ChildHealthSupplementStatusSerializer(stat).data)
        return statuses

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
 
    # Include all related histories with their full details
    child_health_histories = ChildHealthHistoryFullSerializer(many=True, read_only=True)
 
    class Meta:
        model = ChildHealthrecord
        fields = "__all__"
    #     fields = [
    #         'chrec_id',
    #         'chr_date',
    #         'ufc_no',
    #         'family_no',
    #         'mother_occupation',
    #         'father_occupation',
    #         'type_of_feeding',
    #         'newborn_screening',
    #         'place_of_delivery_type',
    #         'birth_order',
    #         'pod_location',
    #         'created_at',
    #         'updated_at',
    #         'staff',
    #         'staff_details',
    #         'patrec',
    #         'patrec_details',
    #         'child_health_histories',
    #         'disabilities',
    #     ]
    
    # def get_disabilities(self, obj):
    #     patrec = obj.patrec
    #     disabilities = patrec.patient_disabilities.all()
    #     return PatientDisablitySerializerBase(disabilities, many=True).data
    
    
    
    # "child_health_notes": [
    #                 {
    #                     "chnotes_id": 61,
    #                     "chhist_details": {
    #                         "chhist_id": 64,
    #                         "created_at": "2025-07-09T18:22:55.513168Z",
    #                         "tt_status": "TT5",
    #                         "status": "recorded",
    #                         "chrec": 67
    #                     },
    #                     "followv_details": {
    #                         "followv_id": 98,
    #                         "followv_date": "2025-07-04",
    #                         "followv_status": "pending",
    #                         "followv_description": "Chilsdads",
    #                         "created_at": "2025-07-09T18:22:58.757529Z",
    #                         "updated_at": "2025-07-09T18:22:58.757529Z",
    #                         "patrec": 259
    #                     },
    #                     "staff_details": {
    #                         "staff_id": "00003250624",
    #                         "pos": {
    #                             "pos_id": 7,
    #                             "pos_title": "Barangay Health Workers",
    #                             "pos_max": 10,
    #                             "pos_group": "Barangay Health Staffs",
    #                             "staff": "00001250623"
    #                         },
    #                         "rp": {
    #                             "rp_id": "00003250624",
    #                             "per": {
    #                                 "per_id": 29,
    #                                 "per_lname": "Tabanao",
    #                                 "per_fname": "Christian",
    #                                 "per_mname": "Abe",
    #                                 "per_suffix": null,
    #                                 "per_dob": "2004-02-24",
    #                                 "per_sex": "Male",
    #                                 "per_status": "Single",
    #                                 "per_edAttainment": "College",
    #                                 "per_religion": "Roman Catholic",
    #                                 "per_contact": "09811231123"
    #                             },
    #                             "rp_date_registered": "2025-06-24",
    #                             "staff": "00001250623"
    #                         },
    #                         "assignments": [],
    #                         "staff_assign_date": "2025-06-26",
    #                         "staff_type": "Health Staff",
    #                         "mana