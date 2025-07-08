from rest_framework import serializers
from .models import *
from django.apps import apps
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
import uuid

Staff = apps.get_model('administration', 'Staff')
File = apps.get_model('file', 'File')

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file_name', 'file_type', 'file_path', 'file_url']
        read_only_fields = ['file_type', 'file_path', 'file_url']

class DevelopmentBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevelopmentBudget
        fields = ['gdb_id', 'gdb_name', 'gdb_pax', 'gdb_price']

class GADBudgetFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_File
        fields = ['gbf_id', 'gbf_name', 'gbf_type', 'gbf_path', 'gbf_url']
        extra_kwargs = {
            'gbud': {'write_only': True}
        }

class GAD_Budget_TrackerSerializer(serializers.ModelSerializer):
    gdb = DevelopmentBudgetSerializer(read_only=True)
    files = GADBudgetFileSerializer(many=True, read_only=True)
    gbudy = serializers.PrimaryKeyRelatedField(queryset=GAD_Budget_Year.objects.all())
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), allow_null=True, default=None)

    class Meta:
        model = GAD_Budget_Tracker
        fields = [
            'gbud_num', 'gbud_datetime', 'gbud_type', 'gbud_add_notes', 'gbud_inc_particulars',
            'gbud_inc_amt', 'gbud_exp_particulars', 'gbud_proposed_budget', 'gbud_actual_expense',
            'gbud_remaining_bal', 'gbud_reference_num', 'gbud_is_archive',
            'gbudy', 'gdb', 'staff', 'files'
        ]
        extra_kwargs = {
            'gbud_num': {'read_only': True},
            'gbud_inc_particulars': {'required': False, 'allow_null': True},
            'gbud_inc_amt': {'required': False, 'allow_null': True},
            'gbud_exp_particulars': {'required': False, 'allow_null': True},
            'gbud_proposed_budget': {'required': False, 'allow_null': True},
            'gbud_actual_expense': {'required': False, 'allow_null': True},
            'gbud_reference_num': {'required': False, 'allow_null': True},
            'gbud_remaining_bal': {'required': False, 'allow_null': True},
            'gbud_type': {'required': True}
        }

        def create(self, validated_data):
        # Ensure gbudy is set from the URL parameter if not provided
            if 'gbudy' not in validated_data:
                year = self.context['view'].kwargs.get('year')
                gbudy = GAD_Budget_Year.objects.filter(gbudy_year=year).first()
                if not gbudy:
                    raise serializers.ValidationError({"gbudy": "No budget year found for the given year"})
                validated_data['gbudy'] = gbudy
            return super().create(validated_data)

class GADBudgetYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_Year
        fields = ['gbudy_num', 'gbudy_budget', 'gbudy_year', 'gbudy_expenses', 'gbudy_income', 'gbudy_is_archive']

class ProjectProposalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectProposalLog
        fields = '__all__'
        extra_kwargs = {
            'gprl_id': {'read_only': True},
            'gprl_date_approved_rejected': {'read_only': True}
        }

class ProjectProposalSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    logs = ProjectProposalLogSerializer(many=True, read_only=True)

    def get_status(self, obj):
        return obj.current_status

    class Meta:
        model = ProjectProposal
        fields = [
            'gpr_id', 'gpr_title', 'gpr_background', 'gpr_date', 'gpr_venue',
            'gpr_monitoring', 'gpr_header_img', 'gpr_created', 'gpr_is_archive',
            'gpr_objectives', 'gpr_participants', 'gpr_budget_items', 'gpr_signatories',
            'staff', 'status', 'logs', 'gpr_page_size', 'gbud'
        ]
        extra_kwargs = {
            'gpr_id': {'read_only': True},
            'gpr_created': {'read_only': True},
            'staff': {
                'required': False,
                'write_only': True
            }
        }
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'gprId': data['gpr_id'],
            'gprTitle': data['gpr_title'],
            'gprBackground': data['gpr_background'],
            'gprDate': data['gpr_date'],
            'gprVenue': data['gpr_venue'],
            'gprMonitoring': data['gpr_monitoring'],
            'gprHeaderImage': data['gpr_header_img'],
            'gprDateCreated': data['gpr_created'],
            'gprIsArchive': data['gpr_is_archive'],
            'gprObjectives': data['gpr_objectives'],
            'gprParticipants': data['gpr_participants'],
            'gprBudgetItems': data['gpr_budget_items'],
            'gprSignatories': data['gpr_signatories'],
            'gprPageSize' : data['gpr_page_size'],
            'status': data['status'],
            'staffId': data.get('staff'),
            'staffName': data.get('staff_name', 'Unknown'),
            'logs': data['logs'],
        }


class ProposalSuppDocSerializer(serializers.ModelSerializer):   
    class Meta:
        model = ProposalSuppDoc
        fields = ['psd_id', 'psd_is_archive', 'psd_url', 'psd_name', 'psd_type', 'psd_path']
        extra_kwargs = {
            'gpr': {'read_only': True},
            'psd_is_archive': {'default': False}
        }

class StaffSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = ['staff_id', 'full_name', 'position']

    def get_full_name(self, obj):
        try:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}"
        except AttributeError:
            return "Unknown"

    def get_position(self, obj):
        return obj.pos.pos_title if hasattr(obj, 'pos') and obj.pos else ""

# ===========================================================================================================

class GADDevelopmentBudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevelopmentBudget
        fields = ['gdb_id', 'gdb_name', 'gdb_pax', 'gdb_price']
class GADDevelopmentPlanSerializer(serializers.ModelSerializer):
    budgets = GADDevelopmentBudgetSerializer(many=True, required=False)

    class Meta:
        model = DevelopmentPlan
        fields = '__all__'

    def create(self, validated_data):
        budgets_data = validated_data.pop('budgets', [])
        plan = DevelopmentPlan.objects.create(**validated_data)
        for budget in budgets_data:
            DevelopmentPlan.objects.create(dev=plan, **budget)
        return plan

    def update(self, instance, validated_data):
        budgets_data = validated_data.pop('budgets', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Remove old budgets and add new ones
        instance.budgets.all().delete()
        for budget in budgets_data:
            DevelopmentBudget.objects.create(dev=instance, **budget)
        return instance