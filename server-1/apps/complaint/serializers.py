from rest_framework import serializers
from .models import *

class ComplainantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complainant
        fields = '__all__'

class AccusedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accused
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    complainant_detail = ComplainantSerializer(source='cpnt_id', read_only=True)
    accused_detail = AccusedSerializer(source='acsd_id', read_only=True)
    
    cpnt_id = serializers.PrimaryKeyRelatedField(
        queryset=Complainant.objects.all(),
        write_only=True
    )
    acsd_id = serializers.PrimaryKeyRelatedField(
        queryset=Accused.objects.all(),
        write_only=True
    )

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['comp_created_at']

    def create(self, validated_data):
        return Complaint.objects.create(**validated_data)