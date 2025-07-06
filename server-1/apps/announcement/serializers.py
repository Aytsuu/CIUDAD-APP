from rest_framework import serializers
from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from apps.administration.models import Staff
from apps.account.models import Account
from utils.email import send_email
from django.utils.dateformat import format
from apps.announcement.models import AnnouncementFile

class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = '__all__'


class AnnouncementBaseSerializer(serializers.ModelSerializer):
    files = serializers.SerializerMethodField()
    ann_start_at = serializers.DateTimeField(required=False, allow_null=True)
    ann_end_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Announcement
        fields = '__all__'

    def get_files(self, obj):
        files = AnnouncementFile.objects.filter(ann=obj)
        return AnnouncementFileSerializer(files, many=True).data


class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    position_title = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = AnnouncementRecipient
        fields = [
            'ar_id', 'ar_mode', 'ann', 'position',
            'ar_age', 'position_title', 'email'
        ]

    def get_position_title(self, obj):
        return obj.position.pos_title if obj.position else ""

    def get_email(self, obj):
        try:
            return obj.staff.rp.account.email
        except Exception:
            return None

class BulkAnnouncementRecipientSerializer(serializers.Serializer):
    recipients = AnnouncementRecipientSerializer(many=True)

    def create(self, validated_data):
        print("[DEBUG] BulkAnnouncementRecipientSerializer triggered")

        created_recipients = []
        recipients_data = validated_data.get("recipients", [])

        if not recipients_data:
            print("[ERROR] No recipients provided.")
            return []

        ann = recipients_data[0].get("ann")
        ar_mode = recipients_data[0].get("ar_mode", "email")
        ar_age = recipients_data[0].get("ar_age", None)

        if not ann:
            print("[ERROR] Announcement missing in recipients.")
            return []

        try:
            account = Account.objects.get(email="ganzoganzo188@gmail.com")
            rp = account.rp
            recipient = AnnouncementRecipient.objects.create(
                ann=ann,
                rp=rp,
                ar_mode=ar_mode,
                ar_age=ar_age,
                position=recipients_data[0].get("position")
            )
            created_recipients.append(recipient)

            # Send email
            if ar_mode == "email":
                context = {
                    "ann_title": ann.ann_title,
                    "ann_details": ann.ann_details,
                    "ann_start_at": format(ann.ann_start_at, 'N j, Y, P') if ann.ann_start_at else None,
                    "ann_end_at": format(ann.ann_end_at, 'N j, Y, P') if ann.ann_end_at else None,
                    "ann_type": ann.ann_type,
                    "ar_mode": [ar_mode],
                    "positions": [recipient.position.pos_title] if recipient.position else [],
                    "ar_age": [ar_age] if ar_age else [],
                    "staff_id": ann.staff.staff_id if ann.staff else "Unknown",
                    "files": AnnouncementFileSerializer(AnnouncementFile.objects.filter(ann=ann), many=True).data,
                }
                print(f"[DEBUG] Sending email to: {account.email}")
                send_email("New Announcement", context, account.email)

        except Account.DoesNotExist:
            print("[ERROR] Account with email 'ganzoganzo188@gmail.com' not found.")
        except Exception as e:
            print(f"[ERROR] Failed to process account: {e}")

        return created_recipients
    
    
class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_mode', 'ann', 'rp']
