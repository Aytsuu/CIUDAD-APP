from .models import *
from rest_framework import serializers


class PatientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalBites
        fields = '__all__'