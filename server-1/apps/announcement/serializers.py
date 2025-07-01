from rest_framework import serializers
from .models import *


class AnnouncementBaseSerializer(serializers.ModelSerializer):
    files= serializers.SerializerMethodField()
    ann_start_at = serializers.DateTimeField(required=False, allow_null=True)
    ann_end_at = serializers.DateTimeField(required=False, allow_null=True)

    def get_files(self,obj):
        files = AnnouncementFile.objects.filter(ann = obj)
        return AnnouncementFileSerializer(files, many = True).data

    class Meta:
        model = Announcement

        fields = '__all__'


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = '__all__'




class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    position_title = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ar_mode', 'ann', 'position', 'ar_age', 'position_title']

    def get_position_title(self, obj):
        return obj.position.pos_title if obj.position else ""




class BulkAnnouncementRecipientSerializer(serializers.Serializer):
    recipients = AnnouncementRecipientSerializer(many=True)

    def create(self, validated_data):
        recipients_data = validated_data['recipients']
        recipients = [AnnouncementRecipient(**data) for data in recipients_data]
        return AnnouncementRecipient.objects.bulk_create(recipients)


class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_mode', 'ann', 'rp']
