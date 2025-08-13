from rest_framework import serializers
from .models import Announcement, AnnouncementFile, AnnouncementRecipient


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = '__all__'


# ✅ Move this up so it’s defined before being used
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


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    files = serializers.SerializerMethodField()
    recipients = AnnouncementRecipientSerializer(many=True, required=False)
    ann_start_at = serializers.DateTimeField(required=False, allow_null=True)
    ann_end_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Announcement
        fields = '__all__'

    def get_files(self, obj):
        files = AnnouncementFile.objects.filter(ann=obj)
        return AnnouncementFileSerializer(files, many=True).data

    def create(self, validated_data):
        recipients_data = validated_data.pop('recipients', [])
        announcement = Announcement.objects.create(**validated_data)
        for recipient in recipients_data:
            AnnouncementRecipient.objects.create(ann=announcement, **recipient)
        return announcement


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
