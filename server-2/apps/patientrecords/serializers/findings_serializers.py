from rest_framework import serializers
from ..models import *
from datetime import date

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = '__all__'
        
