from rest_framework import serializers
from .models import *
from django.apps import apps
from decimal import Decimal

Staff = apps.get_model('administration', 'Staff')
File = apps.get_model('file', 'File')

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

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['file_name', 'file_type', 'file_path', 'file_url']
        read_only_fields = ['file_type', 'file_path', 'file_url']

class GADBudgetFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_File
        fields = ['gbf_id', 'gbf_name', 'gbf_type', 'gbf_path', 'gbf_url']
        extra_kwargs = {
            'gbud': {'write_only': True}
        }

class GAD_Budget_TrackerSerializer(serializers.ModelSerializer):
    gbudy = serializers.PrimaryKeyRelatedField(queryset=GAD_Budget_Year.objects.all())
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), allow_null=True, default=None)
    gpr = serializers.PrimaryKeyRelatedField(queryset=ProjectProposal.objects.all(), allow_null=True, default=None)

    class Meta:
        model = GAD_Budget_Tracker
        fields = [
            'gbud_num', 'gbud_datetime', 'gbud_type', 'gbud_add_notes', 'gbud_inc_particulars',
            'gbud_inc_amt', 'gbud_exp_particulars', 'gbud_exp_project', 'gbud_actual_expense',
            'gbud_remaining_bal', 'gbud_reference_num', 'gbud_is_archive',
            'gbudy', 'staff', 'gpr', "gbud_proposed_budget",
        ]
        extra_kwargs = {
            'gbud_num': {'read_only': True},
            'gbud_inc_particulars': {'required': False, 'allow_null': True},
            'gbud_inc_amt': {'required': False, 'allow_null': True},
            'gbud_exp_particulars': {'required': False, 'allow_null': True},
            'gbud_exp_project': {'required': False, 'allow_null': True},
            'gbud_proposed_budget': {'required': False, 'allow_null': True},
            'gbud_actual_expense': {'required': False, 'allow_null': True},
            'gbud_reference_num': {'required': False, 'allow_null': True},
            'gbud_remaining_bal': {'required': False, 'allow_null': True},
            'gbud_type': {'required': True}
        }

    def validate(self, data):
        if data["gbud_type"] == "Expense":
            if not data.get("gbud_exp_project"):
                raise serializers.ValidationError({"gbud_exp_project": "Project title is required for expense entries"})
            if not data.get("gpr"):
                raise serializers.ValidationError({"gpr": "Valid project ID is required for expense entries"})
            if not data.get("gbud_exp_particulars") or not isinstance(data["gbud_exp_particulars"], list):
                raise serializers.ValidationError({"gbud_exp_particulars": "At least one budget item is required for expense entries"})

            # Fetch project and existing budget entries
            recorded_items = GAD_Budget_Tracker.objects.filter(
                gbud_type="Expense",
                gpr=data["gpr"],
                gbudy__gbudy_year=data["gbudy"].gbudy_year
            ).values_list("gbud_exp_particulars", flat=True)
            recorded_item_names = {item["name"] for entry in recorded_items if entry for item in entry}

            # Validate gbud_exp_particulars includes all recorded items
            submitted_item_names = {item["name"] for item in data["gbud_exp_particulars"]}
            if not recorded_item_names.issubset(submitted_item_names):
                raise serializers.ValidationError({
                    "gbud_exp_particulars": "Must include all previously recorded budget items for this project"
                })

            # Calculate proposed_budget (sum of unrecorded items' amounts)
            unrecorded_items = [
                item for item in data["gbud_exp_particulars"]
                if item["name"] not in recorded_item_names
            ]
            proposed_budget = sum(Decimal(str(item["amount"])) for item in unrecorded_items)
            data["gbud_proposed_budget"] = proposed_budget

        elif data["gbud_type"] == "Income":
            if not data.get("gbud_inc_particulars"):
                raise serializers.ValidationError({"gbud_inc_particulars": "Income particulars are required"})
            if data.get("gbud_inc_amt") is None:
                raise serializers.ValidationError({"gbud_inc_amt": "Income amount is required"})
            data["gbud_proposed_budget"] = None

        return data

    def create(self, validated_data):
         # Create instance
        instance = GAD_Budget_Tracker.objects.create(**validated_data)
        
        # Convert to Decimal for safe arithmetic
        proposed_budget = Decimal(str(instance.gbud_proposed_budget or 0))
        actual_expense = Decimal(str(instance.gbud_actual_expense or 0))
        
        # Perform calculation (e.g., for remaining balance)
        budget_difference = proposed_budget - actual_expense
        
        # Update remaining balance or other logic
        instance.gbud_remaining_bal = (
            instance.gbud_remaining_bal - actual_expense
            if instance.gbud_remaining_bal is not None
            else budget_difference
        )
        
        # Save instance
        instance.save()
        
        GADBudgetLog.objects.create(
            gbudl_budget_entry=instance,
            gbudl_amount_returned=float(budget_difference)
        )
        
        return instance

class GADBudgetYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_Year
        fields = ['gbudy_num', 'gbudy_budget', 'gbudy_year', 'gbudy_expenses', 'gbudy_income', 'gbudy_is_archive']
        
class GADBudgetLogSerializer(serializers.ModelSerializer):
    gbud_exp_project = serializers.CharField(source='gbudl_budget_entry.gbud_exp_project', read_only=True)
    gbud_exp_particulars = serializers.JSONField(source='gbudl_budget_entry.gbud_exp_particulars', read_only=True)
    gbud_proposed_budget = serializers.DecimalField(
        source='gbudl_budget_entry.gbud_proposed_budget', 
        max_digits=10, 
        decimal_places=2,
        read_only=True
    )
    gbud_actual_expense = serializers.DecimalField(
        source='gbudl_budget_entry.gbud_actual_expense', 
        max_digits=10, 
        decimal_places=2,
        read_only=True
    )
    gbud_type = serializers.CharField(source='gbudl_budget_entry.gbud_type', read_only=True)

    class Meta:
        model = GADBudgetLog
        fields = [
            'gbudl_id',
            'gbud_exp_project',
            'gbud_exp_particulars',
            'gbud_proposed_budget',
            'gbud_actual_expense',
            'gbudl_amount_returned',
            'gbudl_created_at',
            'gbud_type'
        ]

class ProjectProposalLogSerializer(serializers.ModelSerializer):
    staff_details = StaffSerializer(source='staff', read_only=True)
    gpr_title = serializers.CharField(source='gpr.gpr_title', read_only=True)
    gpr_id = serializers.IntegerField(source='gpr.gpr_id', read_only=True)
    
    class Meta:
        model = ProjectProposalLog
        fields = [
            'gprl_id',
            'gpr_id',
            'gpr_title',   
            'gprl_date_approved_rejected',
            'gprl_reason',
            'gprl_date_submitted',
            'gprl_status',
            'staff',
            'staff_details',
            'gpr'
        ]
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
