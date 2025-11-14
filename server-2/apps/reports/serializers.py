from .models import *
from rest_framework import serializers
from apps.administration.serializers.staff_serializers import *
from utils.supabase_client import upload_to_storage

from rest_framework import serializers
from .models import *
from supabase import create_client, Client
from django.conf import settings
import base64
import logging

logger = logging.getLogger(__name__)

supabase: Client = create_client(
    settings.SUPABASE_URL, 
    settings.SUPABASE_ANON_KEY,
)



class MonthlyRCPReportSerializer(serializers.ModelSerializer):
    staff_details = StaffFullSerializer(source='staff', read_only=True)
    class Meta:
        model = MonthlyRecipientListReport
        fields = '__all__'

class HeaderRecipientListReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeaderRecipientListReporTemplate
        fields = '__all__'
    
class FileInputSerializer(serializers.Serializer):
    file = serializers.CharField()
    name = serializers.CharField()
    type = serializers.CharField()

class UpdateMonthlyRecipientListReportSerializer(serializers.ModelSerializer):
    logo = FileInputSerializer(write_only=True, required=False)
    signature = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = MonthlyRecipientListReport
        fields = "__all__"

    def update(self, instance, validated_data):
        logo_data = validated_data.pop('logo', None)
        
        # Handle logo upload
        if logo_data:
            url = upload_to_storage(logo_data, 'manage-images', 'reports')
            if url:
                instance.logo = url
            else:
                logger.error("Failed to upload logo to storage")
        
        # Handle logo clearing if empty value is sent
        # elif 'logo' in self.initial_data and self.initial_data['logo'] in ['', None]:
        #     instance.logo = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['logo'] = instance.logo
        return representation


class UpdateHeaderReportTemplateSerializer(serializers.ModelSerializer):
    doh_logo = FileInputSerializer(write_only=True, required=False)
    
    class Meta:
        model = HeaderRecipientListReporTemplate
        fields = "__all__"
     

    def update(self, instance, validated_data):
        doh_logo_data = validated_data.pop('doh_logo', None)
        
        # Handle doh_logo upload
        if doh_logo_data:
            url = upload_to_storage(doh_logo_data, 'manage-images', 'reports')
            if url:
                instance.doh_logo = url
            else:
                logger.error("Failed to upload DOH logo to storage")
        
        # # Handle doh_logo clearing if empty value is sent
        # elif 'doh_logo' in self.initial_data and self.initial_data['doh_logo'] in ['', None]:
        #     instance.doh_logo = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['doh_logo'] = instance.doh_logo
        return representation

