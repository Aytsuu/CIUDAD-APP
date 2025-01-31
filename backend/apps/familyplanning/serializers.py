from .models import *
from rest_framework import serializers

class ObstetricalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObstetricalHistory
        fields = '__all__'

class RiskStiSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskSti
        fields = '__all__'