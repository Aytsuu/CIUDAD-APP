from rest_framework import serializers
from ..models import (
    NonCommunicableDisease,
    TBsurveilance,
    SurveyIdentification,
    WaterSupply,
    SanitaryFacility,
    SolidWasteMgmt
)
from apps.administration.models import Staff


class NCDHistorySerializer(serializers.ModelSerializer):
    """Serializer for NCD update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = NonCommunicableDisease.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'ncd_id',
            'ncd_riskclass_age',
            'ncd_comorbidities',
            'ncd_lifestyle_risk',
            'ncd_maintenance_status',
            'rp_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"


class TBHistorySerializer(serializers.ModelSerializer):
    """Serializer for TB Surveillance update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TBsurveilance.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'tb_id',
            'tb_meds_source',
            'tb_days_taking_meds',
            'tb_status',
            'rp_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"


class SurveyHistorySerializer(serializers.ModelSerializer):
    """Serializer for Survey Identification update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SurveyIdentification.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'si_id',
            'si_filled_by',
            'si_informant',
            'si_checked_by',
            'si_date',
            'fam_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"


class WaterSupplyHistorySerializer(serializers.ModelSerializer):
    """Serializer for Water Supply update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = WaterSupply.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'water_sup_id',
            'water_sup_type',
            'water_conn_type',
            'water_sup_desc',
            'hh_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"


class SanitaryFacilityHistorySerializer(serializers.ModelSerializer):
    """Serializer for Sanitary Facility update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SanitaryFacility.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'sf_id',
            'sf_type',
            'sf_desc',
            'sf_toilet_type',
            'hh_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"


class SolidWasteMgmtHistorySerializer(serializers.ModelSerializer):
    """Serializer for Solid Waste Management update history"""
    history_user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SolidWasteMgmt.history.model
        fields = [
            'history_id',
            'history_date',
            'history_type',
            'history_user',
            'history_user_name',
            'swm_id',
            'swn_desposal_type',
            'swm_desc',
            'hh_id',
        ]
    
    def get_history_user_name(self, obj):
        if obj.history_user:
            staff = Staff.objects.filter(staff_id=obj.history_user_id).first()
            if staff and staff.rp and staff.rp.per:
                return f"{staff.rp.per.per_fname} {staff.rp.per.per_lname}"
        return "System"
