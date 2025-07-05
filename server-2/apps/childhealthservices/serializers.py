from rest_framework import serializers
from .models import *
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.patientrecords.serializers.patients_serializers import PatientRecordSerializer
from apps.patientrecords.serializers.vitalsigns_serializers import VitalSignsSerializer
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer
from apps.patientrecords.serializers.bodymesurement_serializers import BodyMeasurementSerializer
from apps.patientrecords.serializers.findings_serializers import FindingSerializer
from apps.medicineservices.serializers import MedicineRequestSerializer
from apps.vaccination.serializers import VaccinationRecordSerializer


class ChildHealthrecordSerializer(serializers.ModelSerializer):
    staff_details = StaffFullSerializer(source='staff', read_only=True)
    patrec_details = PatientRecordSerializer(source='patrec', read_only=True)

    class Meta:
        model = ChildHealthrecord
        fields = '__all__'


class ChildHealthHistorySerializer(serializers.ModelSerializer):
    vital_details = VitalSignsSerializer(source='vital', read_only=True)
    find_details = FindingSerializer(source='find', read_only=True)
    chrec_details = ChildHealthrecordSerializer(source='chrec', read_only=True)

    class Meta:
        model = ChildHealth_History
        fields = '__all__'


class ChildHealthNotesSerializer(serializers.ModelSerializer):
    chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)
    followv_details = FollowUpVisitSerializer(source='followv', read_only=True)
    staff_details = StaffFullSerializer(source='staff', read_only=True)

    class Meta:
        model = ChildHealthNotes
        fields = '__all__'


class ChildHealthSupplementsSerializer(serializers.ModelSerializer):
    medreq_details = MedicineRequestSerializer(source='medreq', read_only=True)
    chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)
    staff_details = StaffFullSerializer(source='staff', read_only=True)

    class Meta:
        model = ChildHealthSupplements
        fields = '__all__'


class NutritionalStatusSerializer(serializers.ModelSerializer):
    bm_details = BodyMeasurementSerializer(source='bm', read_only=True)
    chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)

    class Meta:
        model = NutritionalStatus
        fields = '__all__'


class ExclusiveBFCheckSerializer(serializers.ModelSerializer):
    chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)

    class Meta:
        model = ExclusiveBFCheck
        fields = '__all__'


class ChildHealthImmunizationHistorySerializer(serializers.ModelSerializer):
    vacrec_details = VaccinationRecordSerializer(source='vacrec', read_only=True)
    chhist_details = ChildHealthHistorySerializer(source='chhist', read_only=True)

    class Meta:
        model = ChildHealthImmunizationHistory
        fields = '__all__'
