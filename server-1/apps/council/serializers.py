from rest_framework import serializers
from .models import *


class CouncilSchedulingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilScheduling
        fields = '__all__'

class CouncilAttendeesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilAttendees
        fields = '__all__'

class CouncilAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilAttendance
        fields = '__all__'

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'