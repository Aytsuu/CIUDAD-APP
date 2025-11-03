from rest_framework import serializers
from django.db import transaction
from django.utils.timezone import now
from utils.email import send_email
from apps.account.models import Account
from apps.profiling.models import ResidentProfile
from apps.administration.models import *
from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from utils.supabase_client import upload_to_storage
from apps.notification.utils import create_notification
import logging

logger = logging.getLogger(__name__)

class AnnouncementBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

class AnnouncementListSerializer(serializers.ModelSerializer):
    staff = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    recipients = serializers.SerializerMethodField()
    class Meta:
        model = Announcement
        fields = '__all__'
    
    def get_staff(self, obj):
        info = obj.staff.rp.per
        name = f"{info.per_lname}{f" {info.per_mname[0]}." if info.per_mname else ""} {info.per_fname}"

        return {
            "id": obj.staff.staff_id,
            "name": name,
            "position": obj.staff.pos.pos_title
        }
    
    def get_files(self, obj):        
        return [
            {
                'id': file.af_id,
                'name': file.af_name,
                'type': file.af_type,
                'url': file.af_url
            }
            for file in obj.announcement_files.filter(ann=obj)
        ]
    
    def get_recipients(self, obj):
        recipient = obj.announcement_recipients.filter(ann=obj).first()

        if not recipient: return []

        return {
            'ar_category': recipient.ar_category,
            'ar_types': [
                rec.ar_type
                for rec in obj.announcement_recipients.filter(ann=obj)
            ]
        }


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = ['af_id', 'af_name', 'af_type', 'af_path', 'af_url']  


class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    ar_type = serializers.CharField()  
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type', "ar_category"]
        extra_kwargs = {
            "ar_type": {'required': False, 'allow_null': True}
        }



class FileInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    type = serializers.CharField()
    file = serializers.CharField()


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, many=True, required=False)
    recipients = AnnouncementRecipientSerializer(many=True, required=False)

    announcement_files = AnnouncementFileSerializer(
        source="announcement_files_set", many=True, read_only=True
    )

    class Meta:
        model = Announcement
        fields = '__all__'
        extra_fields = ['announcement_files']

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('files', [])
        recipients_data = validated_data.pop('recipients', [])

        # Create the announcement
        announcement = Announcement.objects.create(**validated_data)

        # Upload files
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
    
    def get_username(self, obj):
        if obj.staff and hasattr(obj.staff, "account") and obj.staff.account:
            return obj.staff.account.username
        return None

class RecipientInputSerializer(serializers.Serializer):
    ann = serializers.PrimaryKeyRelatedField(queryset=Announcement.objects.all(),write_only=True)
    ar_category = serializers.CharField(write_only=True)
    ar_type = serializers.CharField(write_only=True, allow_null=True, required = False)

class BulkAnnouncementRecipientSerializer(serializers.ModelSerializer):
    recipients = RecipientInputSerializer(many=True)

    class Meta:
        model = AnnouncementRecipient
        fields = ['recipients']

    @transaction.atomic
    def create(self, validated_data):
        recipients_data = validated_data.get("recipients", [])

        # Bulk create the recipients
        created_recipients = AnnouncementRecipient.objects.bulk_create(
            [AnnouncementRecipient(**recipient) for recipient in recipients_data]
        )

        rec_list = []

        # Collect recipients (staff or residents)
        for recipient in created_recipients:
            if recipient.ar_category == "staff":
                pos = Position.objects.filter(pos_title__icontains=recipient.ar_type).first()
                if pos:
                    staff_members = Staff.objects.filter(pos=pos)
                    rec_list.extend(staff_members)
            else:
                residents = ResidentProfile.objects.all()
                rec_list.extend(residents)

        if rec_list:
            create_notification(
                title="New Announcement",
                message=f"A new announcement has been posted: {created_recipients[0].ann.ann_title}",
                # sender=self.context['request'].user,
                recipients=rec_list,
                notif_type="announcement",
                target_obj=created_recipients[0].ann
            )

        # Send emails
        for rec in rec_list:
            acc = Account.objects.filter(rp=rec.pk).first()
            if not acc or not acc.email:
                continue

            for recipient in created_recipients:
                announcement = recipient.ann
                if not getattr(announcement, 'ann_to_email', False):
                    continue

                try:
                    context = {
                        'ann_title': announcement.ann_title,
                        'ann_details': announcement.ann_details,
                        'ann_start_at': announcement.ann_start_at,
                        'ann_end_at': announcement.ann_end_at,
                        'ann_event_start': announcement.ann_event_start,
                        'ann_event_end': announcement.ann_event_end,
                        'ann_type': getattr(announcement, 'ann_type', None),
                        'staff_id': getattr(announcement.staff, 'id', 'N/A'),
                        'current_date': now(),
                        'files': list(
                            announcement.announcement_file.all().values(
                                'af_name', 'af_type', 'af_url'
                            )
                        ),
                    }

                    send_email(
                        subject=f"New Announcement: {announcement.ann_title}",
                        context=context,
                        recipient_email=acc.email,
                        from_email="ganzoganzo188@gmail.com",
                    )
                    logger.info(f"Email sent for announcement {announcement.pk} to {acc.email}")

                except Exception as e:
                    logger.error(f"Failed to send email for announcement {announcement.pk}: {e}")

        return created_recipients

class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type', 'ar_category']
