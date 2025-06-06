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
        fields = ['atn_id', 'atn_name','atn_designation', 'atn_present_or_absent', 'ce_id', 'staff_id']

class CouncilAttendanceSerializer(serializers.ModelSerializer):
    file_url = serializers.CharField(source='file.file_url', read_only=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    class Meta:
        model = CouncilAttendance
        fields = '__all__'

class TemplateSerializer(serializers.ModelSerializer):

    temp_below_headerContent = serializers.CharField(
        required=False,
        allow_blank=True,
        trim_whitespace=False
    )
    
    temp_body = serializers.CharField(trim_whitespace=False)

    class Meta:
        model = Template
        fields = '__all__'

Staff = apps.get_model('administration', 'Staff')
class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    position_title = serializers.CharField(source='pos.pos_title', allow_null=True, default=None)  # Add position title

    class Meta:
        model = Staff
        fields = ['staff_id', 'full_name', 'position_title']

    def get_full_name(self, obj):
        try:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}"
        except AttributeError:
            return "Unknown"