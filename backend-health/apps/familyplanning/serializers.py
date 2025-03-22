from rest_framework import serializers
from .models import *


class AcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acknowledgement
        fields = '__all__'

class RiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risk_sti 
        fields = '__all__'
        
class RiskVawSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risk_vaw
        fields = ['unpleasantRelationship', 'partnerDisapproval', 'domesticViolence', 'referredTo', 'otherReferral']

    def validate(self, data):
        referred_to = data.get('referredTo', '')
        other_referral = data.get('otherReferral', '')

        if referred_to == "Others" and not other_referral:
            raise serializers.ValidationError({"otherReferral": "This field is required when referredTo is 'Others'."})

        return data
        
class FPTypeSerializer(serializers.ModelSerializer):
    class Meta: 
        model = FP_Type
        fields = '__all__'
        
class PhysicalExam(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExam
        fields = '__all__'
        
class PelvicExam(serializers.ModelSerializer):
    class Meta:
        model = Pelvic_exam
        fields = '__all__'