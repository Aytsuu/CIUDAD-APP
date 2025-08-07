from rest_framework import serializers
from .models import *
from django.apps import apps

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
    files = GADBudgetFileSerializer(many=True, read_only=True)
    gbudy = serializers.PrimaryKeyRelatedField(queryset=GAD_Budget_Year.objects.all())
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), allow_null=True, default=None)
    gpr = serializers.PrimaryKeyRelatedField(queryset=ProjectProposal.objects.all(), allow_null=True, default=None)

    class Meta:
        model = GAD_Budget_Tracker
        fields = [
            'gbud_num', 'gbud_datetime', 'gbud_type', 'gbud_add_notes', 'gbud_inc_particulars',
            'gbud_inc_amt', 'gbud_exp_particulars', 'gbud_exp_project', 'gbud_actual_expense',
            'gbud_remaining_bal', 'gbud_reference_num', 'gbud_is_archive',
            'gbudy', 'staff', 'files', 'gpr'
        ]
        extra_kwargs = {
            'gbud_num': {'read_only': True},
            'gbud_inc_particulars': {'required': False, 'allow_null': True},
            'gbud_inc_amt': {'required': False, 'allow_null': True},
            'gbud_exp_particulars': {'required': False, 'allow_null': True},
            'gbud_exp_project': {'required': False, 'allow_null': True},
            'gbud_actual_expense': {'required': False, 'allow_null': True},
            'gbud_reference_num': {'required': False, 'allow_null': True},
            'gbud_remaining_bal': {'required': False, 'allow_null': True},
            'gbud_type': {'required': True}
        }

    def validate(self, data):
        gbud_type = data.get('gbud_type')
        gbud_exp_project = data.get('gbud_exp_project')
        gbud_exp_particulars = data.get('gbud_exp_particulars', [])
        gpr = data.get('gpr')
        gbudy = data.get('gbudy')

        if gbud_type == 'Expense':
            if not gbud_exp_project:
                raise serializers.ValidationError({"gbud_exp_project": "Project title is required for expense entries."})
            if not gbud_exp_particulars:
                raise serializers.ValidationError({"gbud_exp_particulars": "Budget items are required for expense entries."})
            
            # Validate that gbud_exp_project matches a ProjectProposal title
            try:
                proposal = ProjectProposal.objects.get(gpr_title=gbud_exp_project, gpr_is_archive=False)
                data['gpr'] = proposal  # Link the ProjectProposal
            except ProjectProposal.DoesNotExist:
                raise serializers.ValidationError({"gbud_exp_project": "Invalid project title."})

            # Fetch all budget items for the project
            project_budget_items = proposal.gpr_budget_items or []
            project_item_names = {item['name'] for item in project_budget_items}

            # Validate submitted particulars are a subset of project budget items
            submitted_names = {item['name'] for item in gbud_exp_particulars}
            if not submitted_names.issubset(project_item_names):
                raise serializers.ValidationError({
                    "gbud_exp_particulars": "Submitted budget items must belong to the project's budget items."
                })

            # Check existing entries for this project and year
            existing_entry = GAD_Budget_Tracker.objects.filter(
                gbudy=gbudy,
                gbud_exp_project=gbud_exp_project,
                gbud_is_archive=False
            ).exclude(gbud_num=data.get('gbud_num'))  # Exclude current entry if updating
            
            if existing_entry.exists():
                # Collect all recorded items across all entries for this project and year
                recorded_items = set()
                for entry in existing_entry:
                    for item in entry.gbud_exp_particulars or []:
                        recorded_items.add(item['name'])
                
                # Ensure all recorded items are included in the submission
                if not recorded_items.issubset(submitted_names):
                    raise serializers.ValidationError({
                        "gbud_exp_particulars": "Must include all previously recorded budget items for this project in the budget year."
                    })

        return data

    def create(self, validated_data):
        if 'gbudy' not in validated_data:
            year = self.context['view'].kwargs.get('year')
            gbudy = GAD_Budget_Year.objects.filter(gbudy_year=year).first()
            if not gbudy:
                raise serializers.ValidationError({"gbudy": "No budget year found for the given year"})
            validated_data['gbudy'] = gbudy
        return super().create(validated_data)

    def create(self, validated_data):
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
