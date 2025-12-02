from rest_framework import serializers
from ..models import SurveyIdentification, Family
from datetime import datetime
import uuid


class SurveyIdentificationSerializer(serializers.ModelSerializer):
    fam_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = SurveyIdentification
        fields = [
            'si_id', 'si_filled_by', 'si_informant', 'si_checked_by', 
            'si_date', 'si_signature', 'si_created_at', 'si_updated_at',
            'fam', 'fam_id'
        ]
        read_only_fields = ['si_id', 'si_created_at', 'si_updated_at', 'fam']

    def create(self, validated_data):
        fam_id = validated_data.pop('fam_id')
        
        try:
            family = Family.objects.get(fam_id=fam_id)
        except Family.DoesNotExist:
            raise serializers.ValidationError(f"Family with ID {fam_id} does not exist")
        
        # Generate auto-incremented ID based on family
        existing_surveys = SurveyIdentification.objects.filter(fam=family).count()
        si_id = f"{fam_id}-SI-{existing_surveys + 1:03d}"
        
        survey_identification = SurveyIdentification.objects.create(
            si_id=si_id,
            fam=family,
            **validated_data
        )
        
        return survey_identification

    def update(self, instance, validated_data):
        fam_id = validated_data.pop('fam_id', None)
        
        if fam_id:
            try:
                family = Family.objects.get(fam_id=fam_id)
                instance.fam = family
            except Family.DoesNotExist:
                raise serializers.ValidationError(f"Family with ID {fam_id} does not exist")
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class SurveyIdentificationListSerializer(serializers.ModelSerializer):
    family_id = serializers.CharField(source='fam.fam_id', read_only=True)
    family_building = serializers.CharField(source='fam.fam_building', read_only=True)
    
    class Meta:
        model = SurveyIdentification
        fields = [
            'si_id', 'si_filled_by', 'si_informant', 'si_checked_by', 
            'si_date', 'si_created_at', 'si_updated_at', 
            'family_id', 'family_building'
        ]


class SurveyIdentificationDetailSerializer(serializers.ModelSerializer):
    family_id = serializers.CharField(source='fam.fam_id', read_only=True)
    family_building = serializers.CharField(source='fam.fam_building', read_only=True)
    family_indigenous = serializers.CharField(source='fam.fam_indigenous', read_only=True)
    household_id = serializers.CharField(source='fam.hh.hh_id', read_only=True)
    
    class Meta:
        model = SurveyIdentification
        fields = [
            'si_id', 'si_filled_by', 'si_informant', 'si_checked_by', 
            'si_date', 'si_signature', 'si_created_at', 'si_updated_at',
            'family_id', 'family_building', 'family_indigenous', 'household_id'
        ]


class SurveyIdentificationUpdateSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = SurveyIdentification
        fields = [
            'si_filled_by',
            'si_informant',
            'si_checked_by',
            'si_date',
            'si_signature',
            'staff_id'
        ]
    
    def update(self, instance, validated_data):
        from apps.administration.models import Staff
        
        # Extract staff_id for history tracking
        staff_id = validated_data.pop('staff_id', None)
        
        # Set history user if staff_id provided
        if staff_id:
            try:
                staff = Staff.objects.get(staff_id=staff_id)
                instance._history_user = staff
            except Staff.DoesNotExist:
                pass
        
        # Update instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

