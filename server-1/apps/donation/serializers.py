from rest_framework import serializers
from .models import *
from django.apps import apps

Personal = apps.get_model('profiling', 'Personal')

class PersonalSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Personal
        fields = ['per_id', 'full_name']

    def get_full_name(self, obj):
        try:
            return f"{obj.per_fname} {obj.per_lname}"
        except AttributeError:
            return "Unknown"

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'don_num', 'don_donor', 'don_item_name', 'don_qty', 
            'don_description', 'don_category', 'don_date', 'don_status',
            'don_dist_head', 'don_dist_date', 'donor_name'
        ]
        extra_kwargs = {
            'don_num': {'read_only': True},
            'don_description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'don_dist_head': {'required': False, 'allow_null': True, 'allow_blank': True},
            'don_dist_date': {'required': False, 'allow_null': True},
        }

    def get_donor_name(self, obj):
        if obj.don_donor == "Anonymous":
            return "Anonymous"
        return obj.don_donor or "Unknown"
    
    def get_dist_staff_name(self, obj):
        return obj.don_dist_head

    # def create(self, validated_data):
    #     if validated_data.get('don_donor') == "Anonymous":
    #         validated_data['per_id'] = None
    #     return super().create(validated_data)

    # def update(self, instance, validated_data):
    #     if validated_data.get('don_donor') == "Anonymous":
    #         validated_data['per_id'] = None
    #     return super().update(instance, validated_data)
    
Staff = apps.get_model('administration', 'Staff')
class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    position_title = serializers.CharField(source='pos.pos_title', allow_null=True, default=None)

    class Meta:
        model = Staff
        fields = ['staff_id', 'full_name', 'position_title']

    def get_full_name(self, obj):
        try:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}"
        except AttributeError:
            return "Unknown"