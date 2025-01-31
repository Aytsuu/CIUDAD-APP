from .models import *
from rest_framework import serializers

class ObstetricalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObstetricalHistory
        fields = '__all__'

class RiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskSti
        fields = 'abnormalDischarge','sores','pain','history','hiv'
        
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

class AcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acknowledgement
        fields = '__all__'