from rest_framework import serializers
from ..models import *
  
class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model =MedicalHistory
        fields = '__all__'
      
       

