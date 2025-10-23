# from rest_framework import serializers
# from apps.profiling.serializers.resident_profile_serializers import ResidentProfileBaseSerializer
# from apps.administration.serializers.staff_serializers import StaffMinimalSerializer
# from .models import *
# import json

# class ComplaintSerializer(serializers.ModelSerializer):
#     complainant = ComplainantSerializer(many=True, read_only=True)
#     accused = AccusedSerializer(many=True, read_only=True)
#     class Meta:
#         model = Complaint
#         fields = '__all__'