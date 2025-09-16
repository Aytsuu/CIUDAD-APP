from rest_framework import viewsets
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from operator import itemgetter


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    
    def list(self, request, *args, **kwargs):
     
        activity_logs = ActivityLog.objects.all()
        activity_logs_serialized = ActivityLogSerializer(activity_logs, many=True).data
        
        # Normalize to unified format
        custom_logs = [
            {
                'timestamp': log['act_timestamp'],
                'type': log['act_type'],
                'description': log['act_description'],
                'staff_name': log.get('staff_name', ''),
                'module': (log.get('act_module') or '').title(),
                'action': (log.get('act_action') or '').title(),
                'record_id': log.get('act_record_id', ''),
                'source': 'custom_activity_log',
            }
            for log in activity_logs_serialized
        ]

        # Search filter with safe string handling
        search = request.query_params.get('search', '').strip().lower()
        if search:
            custom_logs = [
                log for log in custom_logs
                if search in (log.get('type', '') or '').lower()
                or search in (log.get('description', '') or '').lower()
                or search in (log.get('staff_name', '') or '').lower()
                or search in (log.get('module', '') or '').lower()
                or search in (log.get('action', '') or '').lower()
            ]

        # Sort by timestamp (newest first)
        sorted_logs = sorted(custom_logs, key=itemgetter('timestamp'), reverse=True)
        return Response(sorted_logs)
    
    def get_queryset(self):
        return ActivityLog.objects.filter(
            staff__staff_id="00003250722"
        ) 
