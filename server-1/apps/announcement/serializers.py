from rest_framework import serializers
from .models import Announcement, AnnouncementFile, AnnouncementRecipient


class AnnouncementBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = '__all__'


class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_mode', 'ar_type', 'ann', 'rp', 'staff']


class BulkAnnouncementRecipientSerializer(serializers.Serializer):
    recipients = AnnouncementRecipientSerializer(many=True)

    def create(self, validated_data):
        recipients_data = validated_data['recipients']
        recipients = [AnnouncementRecipient(**data) for data in recipients_data]
        return AnnouncementRecipient.objects.bulk_create(recipients)


class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_mode', 'ar_type', 'ann', 'rp']
