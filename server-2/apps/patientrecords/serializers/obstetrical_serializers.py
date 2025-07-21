from rest_framework import serializers
from ..models import *
from datetime import date

class ObstetricalHistorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Obstetrical_History
        fields = '__all__'
