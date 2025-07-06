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

        request = self.context.get('request')
        sender_email = request.user.email if request and hasattr(request.user, 'email') else None

        created_recipients = []
        recipients_data = validated_data.get("recipients", [])

        if not recipients_data:
            print("[ERROR] No recipients provided.")
            return []

        try:
            try:
                account = Account.objects.get(email=sender_email)
                rp = account.rp
            except Account.DoesNotExist:
                print(f"[WARNING] Account with email '{sender_email}' not found. Proceeding without rp.")
                account = None
                rp = None

            for data in recipients_data:
                ann = data.get("ann")
                ar_mode = data.get("ar_mode", "email")
                ar_age = data.get("ar_age", None)
                position = data.get("position")

                if not ann:
                    print("[ERROR] Announcement missing in recipients. Skipping...")
                    continue

                recipient = AnnouncementRecipient.objects.create(
                    ann=ann,
                    rp=rp,
                    ar_mode=ar_mode,
                    ar_age=ar_age,
                    position=position
                )
                created_recipients.append(recipient)

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

                    final_sender = sender_email if sender_email else None
                    all_accounts = Account.objects.all()

                    for acc in all_accounts:
                        print(f"[DEBUG] Sending email to: {acc.email} from: {final_sender}")
                        send_email("New Announcement", context, acc.email, from_email=final_sender)

        except Exception as e:
            print(f"[ERROR] Failed to process bulk recipients: {e}")

        return created_recipients


class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_mode', 'ann', 'rp']
