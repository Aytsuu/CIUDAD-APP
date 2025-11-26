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
                # Error processing file
                continue

        if gbf_files:
            GAD_Budget_File.objects.bulk_create(gbf_files)
    
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
                    continue

                # Delete from Supabase storage
                remove_from_storage('budget-tracker-bucket', file_path)
                
                # Delete the database record
                GAD_Budget_File.objects.filter(gbf_id=file_id, gbud=tracker_instance).delete()
                
            except Exception as e:
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
            'gbud_remaining_bal', 'gbud_is_archive', 'gbud_project_index', 'gbud_reference_num',
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
        

class ProjectProposalSerializer(serializers.ModelSerializer):
    gpr_header_img = serializers.JSONField(write_only=True, required=False, allow_null=True)
    dev_details = serializers.SerializerMethodField()
    project_title = serializers.SerializerMethodField()
    participants = serializers.JSONField(required=False)
    budget_items = serializers.JSONField(required=False)
    project_date = serializers.SerializerMethodField()
    
    def to_internal_value(self, data):
        # Map selectedDevProject to dev if needed
        if 'selectedDevProject' in data and 'dev' not in data:
            data['dev'] = data['selectedDevProject']
        return super().to_internal_value(data)
    
    def get_dev_details(self, obj):
        """Get development plan details for this proposal, with parsed dev_project and dev_indicator"""
        # Get dev data from either model instance or dictionary
        dev_data = None
        if hasattr(obj, 'dev'):
            dev_data = obj.dev
        elif isinstance(obj, dict) and 'dev' in obj:
            dev_data = obj['dev']
        
        if dev_data:
            # --- Parse dev_project ---
            dev_project_raw = None
            if hasattr(dev_data, 'dev_project'):
                dev_project_raw = dev_data.dev_project
            elif isinstance(dev_data, dict):
                dev_project_raw = dev_data.get('dev_project')
            
            try:
                dev_project = json.loads(dev_project_raw) if dev_project_raw else {}
            except (ValueError, TypeError):
                dev_project = dev_project_raw or {}

            # --- Parse dev_indicator ---
            parsed_indicators = []
            dev_indicator = []
            
            if hasattr(dev_data, 'dev_indicator'):
                dev_indicator = dev_data.dev_indicator or []
            elif isinstance(dev_data, dict):
                dev_indicator = dev_data.get('dev_indicator', [])
            
            for entry in dev_indicator:
                if isinstance(entry, dict):
                    parsed_indicators.append({
                        "category": entry.get("category", ""),
                        "count": entry.get("count", None)
                    })
                elif isinstance(entry, str):
                    parts = [p.strip() for p in entry.split(",") if p.strip()]
                    for part in parts:
                        match = re.match(r'^(.*?)\s*\((\d+)\s*participants?\)$', part)
                        if match:
                            category, count = match.groups()
                            parsed_indicators.append({"category": category.strip(), "count": int(count)})
                        else:
                            parsed_indicators.append({"category": part, "count": None})
                else:
                    parsed_indicators.append({"category": str(entry), "count": None})

            return {
                'dev_id': dev_data.dev_id if hasattr(dev_data, 'dev_id') else dev_data.get('dev_id'),
                'dev_project': dev_project,
                'dev_budget_items': dev_data.dev_budget_items if hasattr(dev_data, 'dev_budget_items') else dev_data.get('dev_budget_items', []),
                'dev_res_person': dev_data.dev_res_person if hasattr(dev_data, 'dev_res_person') else dev_data.get('dev_res_person', []),
                'dev_indicator': parsed_indicators,
                'dev_client': dev_data.dev_client if hasattr(dev_data, 'dev_client') else dev_data.get('dev_client'),
                'dev_issue': dev_data.dev_issue if hasattr(dev_data, 'dev_issue') else dev_data.get('dev_issue'),
                'dev_date': dev_data.dev_date if hasattr(dev_data, 'dev_date') else dev_data.get('dev_date')
            }
        return None

    def get_project_title(self, obj):
        """Get project title from development plan"""
        # Get dev data from either model instance or dictionary
        dev_data = None
        if hasattr(obj, 'dev'):
            dev_data = obj.dev
        elif isinstance(obj, dict) and 'dev' in obj:
            dev_data = obj['dev']
        
        if dev_data:
            dev_project = None
            if hasattr(dev_data, 'dev_project'):
                dev_project = dev_data.dev_project
            elif isinstance(dev_data, dict):
                dev_project = dev_data.get('dev_project')
            
            if dev_project:
                try:
                    projects = json.loads(dev_project) if dev_project else {}
                    if isinstance(projects, list) and projects:
                        return projects[0] if isinstance(projects[0], str) else "Untitled Project"
                    elif isinstance(projects, str):
                        return projects
                except (json.JSONDecodeError, TypeError):
                    return dev_project
        return "Untitled Project"

    def get_participants(self, obj):
        """Get participants from development plan indicators"""
        # Get dev data from either model instance or dictionary
        dev_data = None
        if hasattr(obj, 'dev'):
            dev_data = obj.dev
        elif isinstance(obj, dict) and 'dev' in obj:
            dev_data = obj['dev']
        
        if dev_data:
            dev_indicator = []
            if hasattr(dev_data, 'dev_indicator'):
                dev_indicator = dev_data.dev_indicator or []
            elif isinstance(dev_data, dict):
                dev_indicator = dev_data.get('dev_indicator', [])
            
            result = []
            for entry in dev_indicator:
                if isinstance(entry, dict):
                    category = str(entry.get("category", "")).strip()
                    count = entry.get("count")
                    try:
                        count = int(count)
                    except (ValueError, TypeError):
                        count = None
                    result.append({"category": category, "count": count})
                elif isinstance(entry, str):
                    parts = [p.strip() for p in entry.split(",") if p.strip()]
                    for part in parts:
                        match = re.match(r'^(.*?)\s*\((\d+)\s*participants?\)$', part)
                        if match:
                            category, count = match.groups()
                            result.append({"category": category.strip(), "count": int(count)})
                        else:
                            result.append({"category": part, "count": None})
            return result
        return []

    def get_budget_items(self, obj):
        """Get budget items from development plan"""
        # Get dev data from either model instance or dictionary
        dev_data = None
        if hasattr(obj, 'dev'):
            dev_data = obj.dev
        elif isinstance(obj, dict) and 'dev' in obj:
            dev_data = obj['dev']
        
        if dev_data:
            if hasattr(dev_data, 'dev_budget_items'):
                return dev_data.dev_budget_items
            elif isinstance(dev_data, dict):
                return dev_data.get('dev_budget_items', [])
        return []
    
    def get_project_date(self, obj):
        """Get project date from development plan"""
        if hasattr(obj, 'dev') and obj.dev and obj.dev.dev_date:
            return obj.dev.dev_date
        elif isinstance(obj, dict) and 'dev' in obj:
            dev_data = obj['dev']
            if hasattr(dev_data, 'dev_date'):
                return dev_data.dev_date
            elif isinstance(dev_data, dict):
                return dev_data.get('dev_date')
        return None
    
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
        participants = validated_data.pop('participants', None)
        budget_items = validated_data.pop('budget_items', None)
        header_img_data = validated_data.pop('gpr_header_img', None)
        instance = super().create(validated_data)
        
        date_data = self.context['request'].data.get('gpr_date') if 'request' in self.context else None
        
        if participants is not None or budget_items is not None or date_data is not None:
            dev_plan = instance.dev
            if dev_plan:
                if participants is not None:
                    dev_plan.dev_indicator = participants
                if budget_items is not None:
                    dev_plan.dev_budget_items = budget_items
                if date_data is not None:
                    dev_plan.dev_date = date_data
                try:
                    dev_plan.save()
                except Exception as e:
                    # Error saving DevelopmentPlan
                    pass
                        
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
        
        participants = validated_data.pop('participants', None)
        budget_items = validated_data.pop('budget_items', None)
        date_data = self.context['request'].data.get('gpr_date') if 'request' in self.context else None
        
        # Update the related DevelopmentPlan if participants or budget_items are provided
        if participants is not None or budget_items is not None or date_data is not None:
            dev_plan = instance.dev
            if dev_plan:
                if participants is not None:
                    dev_plan.dev_indicator = participants
                if budget_items is not None:
                    dev_plan.dev_budget_items = budget_items
                if date_data is not None:
                    dev_plan.dev_date = date_data
                dev_plan.save()

        instance = super().update(instance, validated_data)
        return instance

    def to_representation(self, instance):
        # Check if instance is a dictionary (during validation) or a model instance
        if isinstance(instance, dict):
            # During validation phase - return minimal data
            staff_value = instance.get('staff')
            staff_id = None
            
            # Extract staff ID from different possible formats
            if isinstance(staff_value, dict):
                staff_id = staff_value.get('staff_id')
            elif hasattr(staff_value, 'staff_id'):
                staff_id = staff_value.staff_id
            elif isinstance(staff_value, (int, str)):
                staff_id = staff_value
            
            # Extract dev ID from different possible formats
            dev_value = instance.get('dev')
            dev_id = None
            if isinstance(dev_value, dict):
                dev_id = dev_value.get('dev_id')
            elif hasattr(dev_value, 'dev_id'):
                dev_id = dev_value.dev_id
            elif isinstance(dev_value, (int, str)):
                dev_id = dev_value
                
            return {
                'gprId': instance.get('gpr_id'),
                'gprTitle': self.get_project_title(instance),
                'gprBackground': instance.get('gpr_background'),
                'gprDate': self.get_project_date(instance), 
                'gprVenue': instance.get('gpr_venue'),
                'gprMonitoring': instance.get('gpr_monitoring'),
                'gprHeaderImage': instance.get('gpr_header_img'),
                'gprDateCreated': instance.get('gpr_created'),
                'gprIsArchive': instance.get('gpr_is_archive'),
                'gprObjectives': instance.get('gpr_objectives'),
                'gprParticipants': self.get_participants(instance), 
                'gprBudgetItems': self.get_budget_items(instance),   
                'gprSignatories': instance.get('gpr_signatories'),
                'staffId': staff_id,
                'staffName': 'Unknown',
                'devId': dev_id,  # Use the extracted dev ID, not the DevelopmentPlan object
                'devDetails': self.get_dev_details(instance),
                'gbudId': instance.get('gbud'),
            }
        else:
            # During read operations - instance is a model instance
            data = super().to_representation(instance)
            
            # Extract staff ID from different possible formats
            staff_value = data.get('staff')
            staff_id = None
            if isinstance(staff_value, dict):
                staff_id = staff_value.get('staff_id')
            elif hasattr(staff_value, 'staff_id'):
                staff_id = staff_value.staff_id
            elif isinstance(staff_value, (int, str)):
                staff_id = staff_value
            
            # Extract dev ID from different possible formats
            dev_value = data.get('dev')
            dev_id = None
            if isinstance(dev_value, dict):
                dev_id = dev_value.get('dev_id')
            elif hasattr(dev_value, 'dev_id'):
                dev_id = dev_value.dev_id
            elif isinstance(dev_value, (int, str)):
                dev_id = dev_value
                
            return {
                'gprId': instance.gpr_id,
                'gprTitle': self.get_project_title(instance),
                'gprBackground': data.get('gpr_background'),
                'gprDate': self.get_project_date(instance), 
                'gprVenue': data.get('gpr_venue'),
                'gprMonitoring': data.get('gpr_monitoring'),
                'gprHeaderImage': instance.gpr_header_img if instance.gpr_header_img else None,
                'gprDateCreated': data.get('gpr_created'),
                'gprIsArchive': data.get('gpr_is_archive'),
                'gprObjectives': data.get('gpr_objectives'),
                'gprParticipants': self.get_participants(instance), 
                'gprBudgetItems': self.get_budget_items(instance),   
                'gprSignatories': data.get('gpr_signatories'),
                'staffId': staff_id,
                'staffName': data.get('staff_name', 'Unknown'),
                'devId': dev_id,
                'devDetails': data.get('dev_details'),
                'gbudId': data.get('gbud'),
            }

    class Meta:
        model = ProjectProposal
        fields = [
            'gpr_id', 'gpr_background', 'gpr_venue', 'project_date',
            'gpr_monitoring', 'gpr_header_img', 'gpr_created', 'gpr_is_archive',
            'gpr_objectives', 'gpr_signatories', 'project_title', 'budget_items',
            'staff', 'gbud', 'dev', 'dev_details', 'participants'
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
    dev_budget_items = serializers.SerializerMethodField()

    class Meta:
        model = DevelopmentPlan
        fields = '__all__'
        extra_kwargs = {
            'dev_budget_items': { 'required': False }
        }

    def get_total(self, obj):
        try:
            items = [self._normalize_budget_item(i) for i in (obj.dev_budget_items or [])]
            total = sum(Decimal(str(i.get('price', 0))) for i in items)
            return str(total)
        except Exception:
            return "0"

    def get_dev_budget_items(self, obj):
      
        if hasattr(obj, 'dev_budget_items') and obj.dev_budget_items:
            return obj.dev_budget_items
        return []

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
            attrs['dev_budget_items'] = [self._normalize_budget_item(b) for b in attrs['budgets']]

        
        # Handle dev_project as text (not JSON array)
        if 'dev_project' in initial:
            attrs['dev_project'] = initial.get('dev_project', '')
        
        # Handle dev_activity as JSON array
        if 'dev_activity' in initial:
            dev_activity_raw = initial.get('dev_activity')
            if dev_activity_raw:
                try:
                    if isinstance(dev_activity_raw, str):
                        parsed = json.loads(dev_activity_raw)
                        attrs['dev_activity'] = parsed if isinstance(parsed, list) else []
                    else:
                        attrs['dev_activity'] = dev_activity_raw if isinstance(dev_activity_raw, list) else []
                except (ValueError, TypeError):
                    attrs['dev_activity'] = []
            else:
                attrs['dev_activity'] = []
        
        # Handle other JSON fields
        for field in ['dev_res_person', 'dev_indicator']:
            if field in initial:
                normalized = self._ensure_array(initial.get(field))
                attrs[field] = normalized

        return attrs

    def create(self, validated_data):
        # Handle both old and new field names
        budgets_data = validated_data.pop('dev_budget_items', None) or validated_data.pop('budgets', None)
        validated_data.pop('budgets', None)

        if budgets_data is not None:
            # Parse JSON string if it's a string
            if isinstance(budgets_data, str):
                try:
                    import json
                    budgets_data = json.loads(budgets_data)
                except json.JSONDecodeError:
                    budgets_data = []
            
            # Filter out empty items and normalize
            filtered_items = [
                self._normalize_budget_item(b) for b in budgets_data 
                if b and isinstance(b, dict) and b.get('name', '').strip()
            ]
            validated_data['dev_budget_items'] = filtered_items
            
        plan = DevelopmentPlan.objects.create(**validated_data)
        return plan

    def update(self, instance, validated_data):
        # Handle both old and new field names
        budgets_data = validated_data.pop('dev_budget_items', None) or validated_data.pop('budgets', None)
        
        validated_data.pop('budgets', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if budgets_data is not None:
            # Parse JSON string if it's a string
            if isinstance(budgets_data, str):
                try:
                    import json
                    budgets_data = json.loads(budgets_data)
                except json.JSONDecodeError:
                    budgets_data = []
            
            # Filter out empty items and normalize
            filtered_items = [
                self._normalize_budget_item(b) for b in budgets_data 
                if b and isinstance(b, dict) and b.get('name', '').strip()
            ]
            instance.dev_budget_items = filtered_items
        instance.save()
        return instance

    def _normalize_budget_item(self, item):
        if not isinstance(item, dict):
            return { 'name': '', 'quantity': 0, 'price': 0 }
        return {
            'name': item.get('name', item.get('gdb_name', '')),
            'quantity': item.get('quantity', item.get('pax', item.get('gdb_pax', 0))),
            'price': item.get('price', item.get('gdb_price', item.get('gdb_amount', 0))),
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
        # Ensure budgets are not included; use dev_budget_items instead
        data.pop('budgets', None)
        # Add computed total
        data['total'] = self.get_total(instance)
        # Normalize dev_budget_items entries
        try:
            items = getattr(instance, 'dev_budget_items', []) or []
            data['dev_budget_items'] = [self._normalize_budget_item(i) for i in items]
        except Exception:
            pass
        # Present dev_project as text (already handled)
        data['dev_project'] = getattr(instance, 'dev_project', '') or ""
        
        # Present dev_activity as JSON array (keep as is for frontend processing)
        data['dev_activity'] = getattr(instance, 'dev_activity', []) or []
        
        # Present other arrays as comma-separated strings for readability in table
        for field in ['dev_res_person', 'dev_indicator']:
            value = getattr(instance, field, [])
            try:
                arr = value if isinstance(value, list) else self._ensure_array(value)
                data[field] = ", ".join([str(v) for v in arr]) if arr else ""
            except Exception:
                data[field] = str(value) if value is not None else ""
        return data