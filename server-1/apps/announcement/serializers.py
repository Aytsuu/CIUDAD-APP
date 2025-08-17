from rest_framework import serializers
from django.db import transaction
from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from utils.supabase_client import supabase, upload_to_storage
import logging

logger = logging.getLogger(__name__)


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = ['af_id', 'af_name', 'af_type', 'af_path', 'af_url']  
class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    ar_type = serializers.ChoiceField(choices=[
        ('adolecent', 'Adolecent'),
        ('adult', 'Adult'),
        ('senior citizen', 'Senior Citizen'),
        ('midwife', 'Midwife'),
        ('doctor', 'Doctor'),
        ('barangay health worker', 'Barangay Health Worker'),
        ('watchman', 'Watchman'),
        ('waste driver', 'Waste Driver'),
        ('waste collector', 'Waste Collector'),
        ('barangay captain', 'Barangay Captain')
    ])

    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type']


class FileInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    type = serializers.CharField()
    file = serializers.CharField()


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, many=True, required=False)
    recipients = AnnouncementRecipientSerializer(many=True, required=False)

    # ✅ Add nested files (read-only)
    announcement_files = AnnouncementFileSerializer(
        source="announcementfile_set", many=True, read_only=True
    )

    class Meta:
        model = Announcement
        fields = '__all__'
        extra_fields = ['announcement_files']  # ensures it’s added in responses

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('files', [])
        recipients_data = validated_data.pop('recipients', [])

        announcement = Announcement.objects.create(**validated_data)

        for recipient in recipients_data:
            AnnouncementRecipient.objects.create(ann=announcement, **recipient)

        if files:
            self._upload_files(announcement, files)

        return announcement

    def _upload_files(self, announcement_instance, files):
        announcement_files = []
        for file_data in files:
            announcement_file = AnnouncementFile(
                ann=announcement_instance,
                af_name=file_data.get('name'),
                af_type=file_data.get('type'),
                af_path=file_data.get('name'),
            )
            url = upload_to_storage(file_data, 'announcement-bucket', "")
            announcement_file.af_url = url
            announcement_files.append(announcement_file)

        if announcement_files:
            AnnouncementFile.objects.bulk_create(announcement_files)


class BulkAnnouncementRecipientSerializer(serializers.Serializer):
    recipients = AnnouncementRecipientSerializer(many=True)

    def create(self, validated_data):
        recipients_data = validated_data.get("recipients", [])
        created_recipients = []
        for recipient_data in recipients_data:
            recipient = AnnouncementRecipient.objects.create(**recipient_data)
            created_recipients.append(recipient)
        return created_recipients


class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type']
