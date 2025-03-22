<<<<<<< HEAD
from .models import *
from rest_framework import serializers

class ObstetricalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObstetricalHistory
        fields = '__all__'

class RiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskSti
        fields = ['abnormalDischarge', 'dischargeFrom', 'sores', 'pain', 'history', 'hiv']

    def validate(self, data):
        # If abnormalDischarge is True, ensure dischargeFrom is provided
        if data.get('abnormalDischarge') and not data.get('dischargeFrom'):
            raise serializers.ValidationError({"dischargeFrom": "This field is required when abnormal discharge is present."})
        
        # If abnormalDischarge is False, dischargeFrom should be null or empty
        if not data.get('abnormalDischarge') and data.get('dischargeFrom'):
            raise serializers.ValidationError({"dischargeFrom": "This field should be empty when there is no abnormal discharge."})

        return data
        
class RiskVawSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskVaw
        fields = 'unpleasantRelationship','partnerDisapproval','domesticViolence','referredTo'

class PhysicalExamSerializer(serializers.ModelSerializer):
    pelvicExamination = serializers.CharField(required=False, allow_null=True)
    cervicalConsistency = serializers.CharField(required=False, allow_null=True)
    cervicalTenderness = serializers.BooleanField(required=False, allow_null=True)
    cervicalAdnexalMassTenderness = serializers.BooleanField(required=False, allow_null=True)
    uterinePosition = serializers.CharField(required=False, allow_null=True)
    uterineDepth = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = PhysicalExamination
        fields = '__all__'

    def validate(self, data):
        # Get the method from the request data
        method = data.get('method', None)
        
        # If method is IUD, validate IUD-specific fields
        if method == 'IUD':
            if not data.get('pelvicExamination'):
                raise serializers.ValidationError({"pelvicExamination": "Pelvic examination is required for IUD method."})
            if not data.get('cervicalConsistency'):
                raise serializers.ValidationError({"cervicalConsistency": "Cervical consistency is required for IUD method."})
            if not data.get('uterinePosition'):
                raise serializers.ValidationError({"uterinePosition": "Uterine position is required for IUD method."})
        
        return data
=======
from rest_framework import serializers
from .models import *

>>>>>>> eac5b29bec182701333af109425eb1c2c4d6e7d9

class AcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acknowledgement
<<<<<<< HEAD
=======
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
>>>>>>> eac5b29bec182701333af109425eb1c2c4d6e7d9
        fields = '__all__'