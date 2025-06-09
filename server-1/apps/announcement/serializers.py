from rest_framework import serializers
from .models import Announcement, AnnouncementFile, AnnouncementRecipient

class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = '__all__'

class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
