# council/serializers.py
from rest_framework import serializers
from .models import *
from django.apps import apps

class CouncilSchedulingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilScheduling
        fields = '__all__'

class CouncilAttendeesSerializer(serializers.ModelSerializer):
    atn_present_or_absent = serializers.ChoiceField(choices=['Present', 'Absent'])

    class Meta:
        model = CouncilAttendees
        fields = ['atn_id', 'atn_name', 'atn_present_or_absent', 'ce_id', 'staff_id']

class CouncilAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CouncilAttendance
        fields = '__all__'

Staff = apps.get_model('administration', 'Staff')
class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = ['staff_id', 'full_name']

    def get_full_name(self, obj):
        try:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}"
        except AttributeError:
            return "Unknown"