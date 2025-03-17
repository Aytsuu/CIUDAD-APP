from rest_framework import serializers
from .models import *


class CouncilSchedulingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilScheduling
        fields = '__all__'