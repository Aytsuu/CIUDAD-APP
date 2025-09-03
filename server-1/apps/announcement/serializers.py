
from rest_framework import serializers
from django.db import transaction
from django.utils.timezone import now
from utils.email import send_email
from apps.account.models import Account
from apps.administration.models import *
from .models import Announcement, AnnouncementFile, AnnouncementRecipient
from utils.supabase_client import upload_to_storage
import logging

logger = logging.getLogger(__name__)


class AnnouncementFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementFile
        fields = ['af_id', 'af_name', 'af_type', 'af_path', 'af_url']  


class AnnouncementRecipientSerializer(serializers.ModelSerializer):
    ar_type = serializers.CharField()  
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type', "ar_category"]



class FileInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    type = serializers.CharField()
    file = serializers.CharField()


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    files = FileInputSerializer(write_only=True, many=True, required=False)
    recipients = AnnouncementRecipientSerializer(many=True, required=False)

    announcement_files = AnnouncementFileSerializer(
        source="announcementfile_set", many=True, read_only=True
    )

    class Meta:
        model = Announcement
        fields = '__all__'
        extra_fields = ['announcement_files']

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('files', [])
        recipients_data = validated_data.pop('recipients', [])
        print(recipients_data)

        # Create the announcement
        announcement = Announcement.objects.create(**validated_data)

        # Save recipients
        for recipient in recipients_data:
            print(recipient)
            AnnouncementRecipient.objects.create(ann=announcement, **recipient)

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

class BulkAnnouncementRecipientSerializer(serializers.Serializer):
    recipients = AnnouncementRecipientSerializer(many=True)

    @transaction.atomic
    def create(self, validated_data):
        recipients_data = validated_data.get("recipients", [])
        created_recipients = AnnouncementRecipient.objects.bulk_create(
            [AnnouncementRecipient(**recipient) for recipient in recipients_data]
        )

        staff_list = []

        for recipient in created_recipients:
            try:
                pos = Position.objects.get(pos_title=recipient.ar_type)
                staff_members = Staff.objects.filter(pos=pos)
                staff_list.extend(staff_members)
            except Position.DoesNotExist:
                logger.warning(f"Position not found for: {recipient.ar_type}")
                continue

        for staff_member in staff_list:
            acc = Account.objects.filter(rp=staff_member.rp).first()
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
                        'files': list(announcement.announcementfile_set.values(
                            'af_name', 'af_type', 'af_url'
                        ))
                    }

                    send_email(
                        subject=f"New Announcement: {announcement.ann_title}",
                        context=context,
                        recipient_email=acc.email,
                        from_email="ganzoganzo188@gmail.com"
                    )
                    logger.info(f"Email sent for announcement {announcement.pk} to {acc.email}")

                except Exception as e:
                    logger.error(f"Failed to send email for announcement {announcement.pk}: {e}")

        return created_recipients


class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementRecipient
        fields = ['ar_id', 'ann', 'ar_type' 'ar_category']


# from rest_framework import serializers
# from django.db import transaction
# from django.utils.timezone import now
# from utils.email import send_email
# from apps.account.models import Account
# from apps.administration.models import *
# from .models import Announcement, AnnouncementFile, AnnouncementRecipient
# from utils.supabase_client import upload_to_storage
# import logging

# logger = logging.getLogger(__name__)


# class AnnouncementFileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnnouncementFile
#         fields = ['af_id', 'af_name', 'af_type', 'af_path', 'af_url']  


# class AnnouncementRecipientSerializer(serializers.ModelSerializer):
#     ar_type = serializers.CharField()  
#     class Meta:
#         model = AnnouncementRecipient
#         fields = ['ar_id', 'ann', 'ar_type', "ar_category"]



# class FileInputSerializer(serializers.Serializer):
#     name = serializers.CharField()
#     type = serializers.CharField()
#     file = serializers.CharField()


# class AnnouncementCreateSerializer(serializers.ModelSerializer):
#     files = FileInputSerializer(write_only=True, many=True, required=False)
#     recipients = AnnouncementRecipientSerializer(many=True, required=False)

#     announcement_files = AnnouncementFileSerializer(
#         source="announcementfile_set", many=True, read_only=True
#     )

#     class Meta:
#         model = Announcement
#         fields = '__all__'
#         extra_fields = ['announcement_files']

#     @transaction.atomic
#     def create(self, validated_data):
#         files = validated_data.pop('files', [])
#         recipients_data = validated_data.pop('recipients', [])
#         print(recipients_data)

#         # Create the announcement
#         announcement = Announcement.objects.create(**validated_data)

#         # Save recipients
#         for recipient in recipients_data:
#             print(recipient)
#             AnnouncementRecipient.objects.create(ann=announcement, **recipient)

#         # Upload files
#         if files:
#             self._upload_files(announcement, files)

#         return announcement

#     def _upload_files(self, announcement_instance, files):
#         announcement_files = []
#         for file_data in files:
#             announcement_file = AnnouncementFile(
#                 ann=announcement_instance,
#                 af_name=file_data.get('name'),
#                 af_type=file_data.get('type'),
#                 af_path=file_data.get('name'),
#             )
#             url = upload_to_storage(file_data, 'announcement-bucket', "")
#             announcement_file.af_url = url
#             announcement_files.append(announcement_file)

#         if announcement_files:
#             AnnouncementFile.objects.bulk_create(announcement_files)

# class BulkAnnouncementRecipientSerializer(serializers.Serializer):
#     recipients = AnnouncementRecipientSerializer(many=True)

#     @transaction.atomic
#     def create(self, validated_data):
#         recipients_data = validated_data.get("recipients", [])
#         created_recipients = AnnouncementRecipient.objects.bulk_create(
#             [AnnouncementRecipient(**recipient) for recipient in recipients_data]
#         )

#         for recipient in created_recipients:
#             pos = Position.objects.get(pos_title = recipient.ar_type)
#             new_recipient = Staff.objects.filter(pos = pos.id)
#             if len(new_recipient) > 0:
#                 for recipient in new_recipient:
#                     list.append(recipient)

#         for recipient in list:
#             acc=account.object.filter(rp = recipient.rp).first()
#             email = acc.email
#             if email and getattr(recipient.ann, 'ann_to_email', False):
#                 try:
#                     announcement = recipient.ann
#                     context = {
#                         'ann_title': announcement.ann_title,
#                         'ann_details': announcement.ann_details,
#                         'ann_start_at': announcement.ann_start_at,
#                         'ann_end_at': announcement.ann_end_at,
#                         'ann_event_start': announcement.ann_event_start,
#                         'ann_event_end': announcement.ann_event_end,
#                         'ann_type': getattr(announcement, 'ann_type', None),
#                         'staff_id': getattr(announcement.staff, 'id', 'N/A'),
#                         'current_date': now(),
#                         'files': list(announcement.announcementfile_set.values(
#                             'af_name', 'af_type', 'af_url'
#                         ))
#                     }

#                     send_email(
#                         subject=f"New Announcement: {announcement.ann_title}",
#                         context=context,
#                         recipient_email=email,
#                         from_email="ganzoganzo188@gmail.com"
#                     )
#                     logger.info(f"Email sent for announcement {announcement.pk}")

#                 except Exception as e:
#                     logger.error(f"Failed to send email for announcement {announcement.pk}: {e}")

#         return created_recipients



# class AnnouncementRecipientFilteredSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AnnouncementRecipient
#         fields = ['ar_id', 'ann', 'ar_type' 'ar_category']
