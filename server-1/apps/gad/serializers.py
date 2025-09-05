from rest_framework import serializers
from .models import *
from django.apps import apps
from decimal import Decimal
from utils.supabase_client import upload_to_storage, remove_from_storage
import json
from decimal import Decimal

Staff = apps.get_model('administration', 'Staff')

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


class GADBudgetFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_File
        fields = ['gbf_id', 'gbf_name', 'gbf_type', 'gbf_path', 'gbf_url']
        extra_kwargs = {
            'gbud': {'write_only': True}
        }

    def _upload_files(self, files, gbud_num=None):
        if not gbud_num:
            raise serializers.ValidationError({"error": "gbud_num is required"})

        try:
            tracker_instance = GAD_Budget_Tracker.objects.get(pk=gbud_num)
        except GAD_Budget_Tracker.DoesNotExist:
            raise serializers.ValidationError(f"GAD_Budget_Tracker with id {gbud_num} does not exist")

        gbf_files = []
        for file_data in files:
            try:
                if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                    continue
                
                # Upload to storage and get URL
                file_url = upload_to_storage(
                    file_data,
                    'budget-tracker-bucket',
                    'images'
                )
                
                # Create file record
                gbf_file = GAD_Budget_File(
                    gbf_name=file_data.get('name', f"file_"),
                    gbf_type=file_data.get('type', 'application/octet-stream'),
                    gbf_path=f"images/{file_data.get('name')}",
                    gbf_url=file_url,
                    gbud=tracker_instance
                )
                gbf_files.append(gbf_file)
                
            except Exception as e:
                print(f"Error processing file: {str(e)}")
                continue

        if gbf_files:
            GAD_Budget_File.objects.bulk_create(gbf_files)
        else:
            print('No valid files to save.')
    
    def _delete_files(self, files_to_delete, gbud_num=None):
        if not gbud_num:
            raise serializers.ValidationError({"error": "gbud_num is required"})

        try:
            tracker_instance = GAD_Budget_Tracker.objects.get(pk=gbud_num)
        except GAD_Budget_Tracker.DoesNotExist:
            raise serializers.ValidationError(f"GAD_Budget_Tracker with id {gbud_num} does not exist")

        for file_data in files_to_delete:
            try:
                file_id = file_data.get('id')
                file_path = file_data.get('path')
                
                if not file_id or not file_path:
                    print(f"Skipping file deletion: Missing id or path in {file_data}")
                    continue

                # Delete from Supabase storage
                remove_from_storage('budget-tracker-bucket', file_path)
                
                # Delete the database record
                GAD_Budget_File.objects.filter(gbf_id=file_id, gbud=tracker_instance).delete()
                
            except Exception as e:
                print(f"Error deleting file {file_data.get('id', 'unknown')}: {str(e)}")
                continue

class GADBudgetFileReadSerializer(serializers.ModelSerializer):
    gbf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GAD_Budget_File
        fields = ['gbf_id', 'gbf_url']  # Only what's needed for display

    def get_gbf_url(self, obj):
        return obj.gbf_url
            
class GAD_Budget_TrackerSerializer(serializers.ModelSerializer):
    gbudy = serializers.PrimaryKeyRelatedField(queryset=GAD_Budget_Year.objects.all())
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), allow_null=True, required=False)
    dev = serializers.PrimaryKeyRelatedField(queryset=DevelopmentPlan.objects.all(), allow_null=True, default=None)
    files = serializers.SerializerMethodField()
    
    class Meta:
        model = GAD_Budget_Tracker
        fields = [
            'gbud_num', 'gbud_datetime', 'gbud_add_notes', 'gbud_exp_particulars', 'gbud_actual_expense',
            'gbud_remaining_bal', 'gbud_reference_num', 'gbud_is_archive', 'gbud_project_index',
            'gbudy', 'staff', "gbud_proposed_budget", 'files', 'dev'
        ]
        extra_kwargs = {
            'gbud_num': {'read_only': True},
            'gbud_exp_particulars': {'required': False, 'allow_null': True},
            'gbud_proposed_budget': {'required': False, 'allow_null': True},
            'gbud_actual_expense': {'required': False, 'allow_null': True},
            'gbud_reference_num': {'required': False, 'allow_null': True},
            'gbud_remaining_bal': {'required': False, 'allow_null': True},
            'dev': {'required': False}
        }

    def validate(self, data):
        if self.instance and self.instance.gbud_proposed_budget:
            data['gbud_proposed_budget'] = self.instance.gbud_proposed_budget

        if not data.get("gbud_exp_particulars") or not isinstance(data["gbud_exp_particulars"], list):
            raise serializers.ValidationError({"gbud_exp_particulars": "At least one budget item is required for expense entries"})
        
        # Only calculate proposed budget for new entries
        if not self.instance:
            recorded_items = GAD_Budget_Tracker.objects.filter(
                dev=data["dev"],
                gbudy__gbudy_year=data["gbudy"].gbudy_year
            ).values_list("gbud_exp_particulars", flat=True)
            recorded_item_names = {item["name"] for entry in recorded_items if entry for item in entry}
            
            submitted_item_names = {item["name"] for item in data["gbud_exp_particulars"]}
            if not recorded_item_names.issubset(submitted_item_names):
                raise serializers.ValidationError({
                    "gbud_exp_particulars": "Must include all previously recorded budget items for this project"
                })

            unrecorded_items = [
                item for item in data["gbud_exp_particulars"]
                if item["name"] not in recorded_item_names
            ]
            
            proposed_budget = Decimal(0)
            for item in unrecorded_items:
                try:
                    pax_str = str(item.get("pax", "1")).split()[0]
                    pax = Decimal(pax_str) if pax_str.replace('.', '', 1).isdigit() else Decimal(1)
                except:
                    pax = Decimal(1)
                    
                amount = Decimal(str(item["amount"]))
                proposed_budget += amount * pax

            data["gbud_proposed_budget"] = proposed_budget

        return data

    def create(self, validated_data):
        instance = GAD_Budget_Tracker.objects.create(**validated_data)
        
        # Create initial log with current actual expense snapshot
        GADBudgetLog.objects.create(
            gbudl_budget_entry=instance,
            gbudl_amount_returned=float(instance.gbud_proposed_budget or 0) - float(instance.gbud_actual_expense or 0),
            gbudl_prev_amount=float(instance.gbud_actual_expense or 0),  # Store current value
        )
        return instance

    def update(self, instance, validated_data):
        current_actual = float(validated_data.get('gbud_actual_expense', instance.gbud_actual_expense) or 0)
        if 'gbud_actual_expense' in validated_data:
        # Only create log if actual expense is changing
            if float(validated_data['gbud_actual_expense']) != float(instance.gbud_actual_expense or 0):
                GADBudgetLog.objects.create(
                    gbudl_budget_entry=instance,
                    gbudl_amount_returned=float(instance.gbud_proposed_budget or 0) - current_actual,
                    gbudl_prev_amount=current_actual,
                )
            
        # Now perform the update (which may change actual_expense)
        return super().update(instance, validated_data)
    
    def get_files(self, obj):
        if self.context.get('request') and self.context['request'].method in ['GET']:
            return GADBudgetFileReadSerializer(obj.files.all(), many=True).data
        return GADBudgetFileSerializer(obj.files.all(), many=True).data

class GADBudgetYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_Year
        fields = ['gbudy_num', 'gbudy_budget', 'gbudy_year', 'gbudy_expenses', 'gbudy_is_archive']
        
class GADBudgetLogSerializer(serializers.ModelSerializer):
    gbud_exp_project = serializers.CharField(source='gbudl_budget_entry.project_title', read_only=True)
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
    current_actual = serializers.SerializerMethodField()

    class Meta:
        model = GADBudgetLog
        fields = [
            'gbudl_id',
            'gbud_exp_project',
            'gbud_exp_particulars',
            'gbud_proposed_budget',
            'gbud_actual_expense',
            'current_actual',
            'gbudl_amount_returned',
            'gbudl_created_at',
            'gbudl_prev_amount',
        ]
    
    def get_current_actual(self, obj):
        """Returns the current actual expense from the related budget entry"""
        return obj.gbudl_budget_entry.gbud_actual_expense
        
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
    gpr_header_img = serializers.JSONField(write_only=True, required=False, allow_null=True)
    dev_details = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    budget_items = serializers.SerializerMethodField()
    
    def get_status(self, obj):
        return obj.current_status
    
    def get_dev_details(self, obj):
        """Get development plan details for this proposal"""
        if obj.dev:
            return {
                'dev_id': obj.dev.dev_id,
                'dev_project': obj.dev.dev_project,
                'dev_gad_items': obj.dev.dev_gad_items,
                'dev_res_person': obj.dev.dev_res_person,
                'dev_indicator': obj.dev.dev_indicator,
                'dev_client': obj.dev.dev_client,
                'dev_issue': obj.dev.dev_issue,
                'dev_date': obj.dev.dev_date
            }
        return None
    
    def get_project_title(self, obj):
        """Get project title from development plan"""
        return obj.project_title
    
    def get_participants(self, obj):
        """Get participants from development plan indicators"""
        return obj.participants
    
    def get_budget_items(self, obj):
        """Get budget items from development plan"""
        return obj.budget_items
    
    def validate_gpr_header_img(self, value):
        if value is None:
            return value
        if not isinstance(value, dict) or 'name' not in value or 'type' not in value or 'file' not in value or not value['file'].startswith('data:'):
            raise serializers.ValidationError({
                'gpr_header_img': 'Must be an object with name, type, and file (base64 data URL)'
            })
        if not value['type'].startswith('image/'):
            raise serializers.ValidationError({
                'gpr_header_img': 'Only image files are allowed'
            })
        return value

    def create(self, validated_data):
        header_img_data = validated_data.pop('gpr_header_img', None)
        instance = super().create(validated_data)

        if header_img_data:
            try:
                # Upload to Supabase
                url = upload_to_storage(header_img_data, 'project-proposal-bucket', 'header_images')
                instance.gpr_header_img = url
                instance.save()
            except Exception as e:
                raise serializers.ValidationError({
                    'gpr_header_img': f"Upload failed: {str(e)}"
                })

        return instance 

    def update(self, instance, validated_data):
        header_img_data = None
        header_img_provided = False
        
        if 'gpr_header_img' in validated_data:
            header_img_data = validated_data.pop('gpr_header_img')
            header_img_provided = True

        if header_img_provided:
            if header_img_data is None:
                instance.gpr_header_img = None
            elif isinstance(header_img_data, dict):
                try:
                    url = upload_to_storage(header_img_data, 'project-proposal-bucket', 'header_images')
                    instance.gpr_header_img = url
                except Exception as e:
                    raise serializers.ValidationError({
                        'gpr_header_img': f"Upload failed: {str(e)}"
                    })

        instance = super().update(instance, validated_data)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'gprId': data['gpr_id'],
            'gprTitle': instance.project_title,  
            'gprBackground': data['gpr_background'],
            'gprDate': data['gpr_date'],
            'gprVenue': data['gpr_venue'],
            'gprMonitoring': data['gpr_monitoring'],
            'gprHeaderImage': instance.gpr_header_img if instance.gpr_header_img else None,
            'gprDateCreated': data['gpr_created'],
            'gprIsArchive': data['gpr_is_archive'],
            'gprObjectives': data['gpr_objectives'],
            'gprParticipants': instance.participants, 
            'gprBudgetItems': instance.budget_items,   
            'gprSignatories': data['gpr_signatories'],
            'gpr_page_size': data['gpr_page_size'],
            'status': data['status'],
            'staffId': data.get('staff'),
            'staffName': data.get('staff_name', 'Unknown'),
            'logs': data['logs'],
            'devId': data.get('dev'),
            'devDetails': data['dev_details'],
            'gbudId': data.get('gbud'),
        }

    class Meta:
        model = ProjectProposal
        fields = [
            'gpr_id', 'gpr_background', 'gpr_date', 'gpr_venue',
            'gpr_monitoring', 'gpr_header_img', 'gpr_created', 'gpr_is_archive',
            'gpr_objectives', 'gpr_signatories', 'project_title', 'budget_items',
            'staff', 'status', 'logs', 'gpr_page_size', 'gbud', 'dev', 'dev_details', 'participants'
        ]
        extra_kwargs = {
            'gpr_id': {'read_only': True},
            'gpr_created': {'read_only': True},
            'staff': {'required': False, 'write_only': True},
            'gpr_header_img': {'write_only': True},
            'dev': {'required': True},
        }

class ProposalSuppDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalSuppDoc
        fields = ['psd_id', 'psd_is_archive', 'psd_name', 'psd_type', 'psd_path', 'psd_url']
        extra_kwargs = {
            'gpr': {'write_only': True},
            'psd_is_archive': {'default': False}
        }

    def _upload_files(self, files, gpr_id=None):
        if not gpr_id:
            raise serializers.ValidationError({"error": "gpr_id is required"})

        try:
            proposal = ProjectProposal.objects.get(pk=gpr_id)
        except ProjectProposal.DoesNotExist:
            raise serializers.ValidationError(f"ProjectProposal with id {gpr_id} does not exist")

        psd_files = []
        for file_data in files:
            if not file_data.get('file') or not isinstance(file_data['file'], str) or not file_data['file'].startswith('data:'):
                continue

            psd_file = ProposalSuppDoc(
                psd_name=file_data['name'],
                psd_type=file_data['type'],
                psd_path=f"Uploads/{file_data['name']}",
                gpr=proposal
            )
            psd_file.psd_url = upload_to_storage(file_data, 'project-proposal-bucket', 'supp_docs')
            psd_files.append(psd_file)

        if psd_files:
            ProposalSuppDoc.objects.bulk_create(psd_files)

# ===========================================================================================================

class GADDevelopmentPlanSerializer(serializers.ModelSerializer):

    total = serializers.SerializerMethodField()
    staff = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all(), allow_null=True, required=False)
    dev_budget_items = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = DevelopmentPlan
        fields = '__all__'
        extra_kwargs = {
            'dev_gad_items': { 'required': False }
        }

    def get_total(self, obj):
        try:
            items = [self._normalize_budget_item(i) for i in (obj.dev_gad_items or [])]
            total = sum(Decimal(str(i.get('price', 0))) for i in items)
            return str(total)
        except Exception:
            return "0"

    def validate(self, attrs):
       
        initial = getattr(self, 'initial_data', {}) or {}
        dev_budget_items_raw = initial.get('dev_budget_items')

        if dev_budget_items_raw and not attrs.get('budgets'):
            try:
                parsed = json.loads(dev_budget_items_raw)
                if isinstance(parsed, list):
                    attrs['budgets'] = [self._normalize_budget_item(p) for p in parsed]
                else:
                    raise serializers.ValidationError({'dev_budget_items': 'Must be a JSON array.'})
            except (ValueError, TypeError):
                raise serializers.ValidationError({'dev_budget_items': 'Invalid JSON provided.'})

        
        if attrs.get('budgets') is not None:
            attrs['dev_gad_items'] = [self._normalize_budget_item(b) for b in attrs['budgets']]

        
        for field in ['dev_project', 'dev_res_person', 'dev_indicator']:
            if field in initial:
                normalized = self._ensure_array(initial.get(field))
                attrs[field] = normalized

        return attrs

    def create(self, validated_data):
        validated_data.pop('dev_budget_items', None)
        budgets_data = validated_data.pop('budgets', None)
        if budgets_data is not None:
            validated_data['dev_gad_items'] = [self._normalize_budget_item(b) for b in budgets_data]
        plan = DevelopmentPlan.objects.create(**validated_data)
        return plan

    def update(self, instance, validated_data):
        validated_data.pop('dev_budget_items', None)
        budgets_data = validated_data.pop('budgets', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if budgets_data is not None:
            instance.dev_gad_items = [self._normalize_budget_item(b) for b in budgets_data]
        instance.save()
        return instance

    def _normalize_budget_item(self, item):
        if not isinstance(item, dict):
            return { 'name': '', 'pax': 0, 'price': 0 }
        return {
            'name': item.get('name', item.get('gdb_name', '')),
            'pax': item.get('pax', item.get('gdb_pax', 0)),
            'price': item.get('price', item.get('gdb_price', 0)),
        }

    def _ensure_array(self, value):
        # Accept already-a-list
        if isinstance(value, list):
            return value
        # Try to parse JSON string
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith('[') and stripped.endswith(']'):
                try:
                    parsed = json.loads(value)
                    return parsed if isinstance(parsed, list) else [str(parsed)]
                except Exception:
                    return [value]
            # Plain string -> wrap
            return [value]
        # Fallback
        return []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure budgets are not included; use dev_gad_items instead
        data.pop('budgets', None)
        # Add computed total
        data['total'] = self.get_total(instance)
        # Normalize dev_gad_items entries
        try:
            items = getattr(instance, 'dev_gad_items', []) or []
            data['dev_gad_items'] = [self._normalize_budget_item(i) for i in items]
        except Exception:
            pass
        # Present arrays as comma-separated strings for readability in table
        for field in ['dev_project', 'dev_res_person', 'dev_indicator']:
            value = getattr(instance, field, [])
            try:
                arr = value if isinstance(value, list) else self._ensure_array(value)
                data[field] = ", ".join([str(v) for v in arr]) if arr else ""
            except Exception:
                data[field] = str(value) if value is not None else ""
        return data