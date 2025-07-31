from rest_framework import serializers
from .models import *
from django.apps import apps

# class DonationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Donation
#         fields = '__all__'
#         extra_kwargs = {
#             'don_num': {'read_only': True} 
#         }

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
            'don_num', 'don_donor', 'don_item_name', 'don_qty', 'don_description',
            'don_category', 'don_date', 'staff', 'per_id', 'donor_name'
        ]
        extra_kwargs = {
            'don_num': {'read_only': True},
            'per_id': {'required': False, 'write_only': True},
            'staff': {'required': False, 'write_only': True},
            'don_description': {'required': False, 'allow_null': True, 'allow_blank': True}
        }

    def get_donor_name(self, obj):
        if obj.don_donor == "Anonymous":
            return "Anonymous"
        if obj.per_id:
            try:
                return f"{obj.per_id.per_fname} {obj.per_id.per_lname}"
            except AttributeError:
                return "Unknown"
        return obj.don_donor or "Unknown"

    def create(self, validated_data):
        if validated_data.get('don_donor') == "Anonymous":
            validated_data['per_id'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('don_donor') == "Anonymous":
            validated_data['per_id'] = None
        return super().update(instance, validated_data)

class OnlineDonationSerializer(serializers.ModelSerializer):
  class Meta:
    model = OnlineDonation
    fields = '__all__'