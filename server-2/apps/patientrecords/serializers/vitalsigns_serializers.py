from rest_framework import serializers
from ..models import *

    
    
class VitalSignsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSigns
        fields = '__all__'

