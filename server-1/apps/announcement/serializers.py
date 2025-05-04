from rest_framework import serializers
from .models import Announcement, AnnouncementFile, AnnouncementRecipient

class AnnouncementSerializer(serializers.ModelSerializer):
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
        fields = '__all__'
