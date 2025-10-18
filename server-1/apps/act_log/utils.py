from django.utils import timezone
from .models import ActivityLog
from apps.administration.models import Staff
import inspect
import os
from rest_framework.response import Response

def create_activity_log(
    act_type,
    act_description,
    staff,
    record_id=None,
    **kwargs
):
    frame = inspect.currentframe().f_back
    module_name = "unknown"
    
    if frame:
      
        filename = frame.f_code.co_filename
        if filename:
            
            path_parts = filename.replace('\\', '/').split('/')
            for i, part in enumerate(path_parts):
                if part == 'apps' and i + 1 < len(path_parts):
                    module_name = path_parts[i + 1]
                    break
    
    act_action = "custom"
    act_type_lower = act_type.lower()
    
    if any(word in act_type_lower for word in ['create', 'created', 'add', 'new']):
        act_action = "create"
    elif any(word in act_type_lower for word in ['update', 'updated', 'edit', 'modify', 'change']):
        act_action = "update"
    elif any(word in act_type_lower for word in ['delete', 'deleted', 'remove']):
        act_action = "delete"
    elif any(word in act_type_lower for word in ['archive', 'archived']):
        act_action = "archive"
    elif any(word in act_type_lower for word in ['approve', 'approved']):
        act_action = "approve"
    elif any(word in act_type_lower for word in ['reject', 'rejected']):
        act_action = "reject"
    elif any(word in act_type_lower for word in ['payment', 'paid']):
        act_action = "payment"
    elif any(word in act_type_lower for word in ['assign', 'assigned']):
        act_action = "assign"
    elif any(word in act_type_lower for word in ['complete', 'completed']):
        act_action = "complete"
    

    # Feature creation removed - no longer posting to feature table
    feature = None
    
    # Filter out any kwargs that aren't actual ActivityLog model fields
    # Common extra params that views might pass: feat_name, etc.
    allowed_fields = {
        'act_timestamp', 'act_type', 'act_description', 
        'act_module', 'act_action', 'act_record_id', 'staff'
    }
    
    # Remove any kwargs that aren't valid model fields
    filtered_kwargs = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    try:
        activity_log = ActivityLog.objects.create(
            act_timestamp=timezone.now(),
            act_type=act_type,
            act_description=act_description,
            act_module=module_name,
            act_action=act_action,
            act_record_id=record_id,
            staff=staff,
            **filtered_kwargs
        )
        return activity_log
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to create activity log: {str(e)}")
        raise e

def log_model_change(model_instance, action, staff, description=None, **kwargs):
   

    model_name = model_instance.__class__.__name__
    model_id = getattr(model_instance, 'pk', None)
    
    # Auto-generate description if not provided
    if not description:
        if action == 'create':
            description = f"{model_name} record created"
        elif action == 'update':
            description = f"{model_name} record updated"
        elif action == 'delete':
            description = f"{model_name} record deleted"
        else:
            description = f"{model_name} record {action}"
   
    return create_activity_log(
        act_type=f"{model_name} {action.title()}",
        act_description=description,
        staff=staff,
        record_id=str(model_id) if model_id else None,
        **kwargs
    )


class ActivityLogMixin:
    """Reusable mixin to automatically log create/update/destroy actions."""
    def perform_create(self, serializer):
        instance = serializer.save()
        try:
            staff = getattr(self.request.user, 'staff', None)
            
            log_model_change(instance, 'create', staff)
        except Exception:
           
            pass
        return instance

    def _detect_action_from_diff(self, old_values: dict, new_values: dict) -> str:
        # Determine specific action label from field changes
        for key in new_values.keys():
            old = old_values.get(key)
            new = new_values.get(key)
            if old == new:
                continue
            k_lower = str(key).lower()
            # Archive/Restore toggles
            if 'archive' in k_lower:
                return 'Archived' if bool(new) else 'Restored'
            # Repeal / Amend flags
            if 'repeal' in k_lower:
                return 'Repealed' if bool(new) else 'Repeal Updated'
            if 'amend' in k_lower:
                return 'Amended' if bool(new) else 'Amendment Updated'
            # Approval / Rejection
            if 'approve' in k_lower or (str(new).lower() == 'approved'):
                return 'Approved'
            if 'reject' in k_lower or (str(new).lower() == 'rejected'):
                return 'Rejected'
            # Payment
            if 'payment' in k_lower or 'paid' in str(new).lower():
                return 'Payment'
            # Assignment
            if 'assign' in k_lower:
                return 'Assigned'
            # Status-based common transitions
            if k_lower.endswith('status'):
                val = str(new).lower()
                if 'approved' in val:
                    return 'Approved'
                if 'rejected' in val:
                    return 'Rejected'
                if 'paid' in val:
                    return 'Payment'
        return 'Updated'

    def _build_diff_description(self, model_instance, old_values: dict, new_values: dict) -> str:
        model_name = model_instance.__class__.__name__
        changes = []
        for key in new_values.keys():
            old = old_values.get(key)
            new = new_values.get(key)
            if old == new:
                continue
            # shorten long strings
            def _short(v):
                s = str(v)
                return (s[:60] + '…') if len(s) > 60 else s
            changes.append(f"{key}: '{_short(old)}' → '{_short(new)}'")
        changes_str = "; ".join(changes) if changes else "No field-level changes recorded"
        return f"{model_name} changes: {changes_str}"

    def perform_update(self, serializer):
        # Capture old values for fields being updated
        instance_before = serializer.instance
        old_values = {}
        if instance_before is not None:
            for k in serializer.validated_data.keys():
                try:
                    old_values[k] = getattr(instance_before, k)
                except Exception:
                    old_values[k] = None

        instance = serializer.save()
        try:
            staff = getattr(self.request.user, 'staff', None)
            # Determine action and build description
            new_values = serializer.validated_data
            action_label = self._detect_action_from_diff(old_values, new_values)
            description = self._build_diff_description(instance, old_values, new_values)

            # Create activity log with targeted action label
            create_activity_log(
                act_type=f"{instance.__class__.__name__} {action_label}",
                act_description=description,
                staff=staff,
                record_id=str(getattr(instance, 'pk', None)) if getattr(instance, 'pk', None) else None,
            )
        except Exception:
            pass
        return instance

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        response = super().destroy(request, *args, **kwargs)
        try:
            staff = getattr(self.request.user, 'staff', None)
            # instance might be deleted; log with id only if accessible
            log_model_change(instance, 'delete', staff)
        except Exception:
            pass
        return response
