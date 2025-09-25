from django.utils import timezone
from .models import ActivityLog
from apps.administration.models import Feature, Staff
import inspect
import os
from rest_framework.response import Response

def create_activity_log(
    act_type,
    act_description,
    staff,
    feat_name=None,
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
    

    feature = None
    if feat_name:
        feature, created = Feature.objects.get_or_create(
            feat_name=feat_name,
            defaults={
                'feat_category': module_name.title(),
                'feat_url': f'/{module_name}/'
            }
        )
    else:
      
        feature, created = Feature.objects.get_or_create(
            feat_name=f'{module_name.title()} Management',
            defaults={
                'feat_category': module_name.title(),
                'feat_url': f'/{module_name}/'
            }
        )
    
 
    activity_log = ActivityLog.objects.create(
        act_timestamp=timezone.now(),
        act_type=act_type,
        act_description=act_description,
        act_module=module_name,
        act_action=act_action,
        act_record_id=record_id,
        feat=feature,
        staff=staff,
        **kwargs
    )
    
    return activity_log

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
            # Avoid breaking the main flow due to logging issues
            pass
        return instance

    def perform_update(self, serializer):
        instance = serializer.save()
        try:
            staff = getattr(self.request.user, 'staff', None)
            log_model_change(instance, 'update', staff)
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
