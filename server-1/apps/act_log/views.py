from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from operator import itemgetter


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        activity_logs = ActivityLog.objects.all()
        activity_logs_serialized = ActivityLogSerializer(activity_logs, many=True).data

        # Map to the keys expected by the frontend while keeping useful extras
        mapped_logs = [
            {
                'act_id': log.get('act_id'),
                'act_timestamp': log.get('act_timestamp'),
                'act_type': log.get('act_type'),
                'act_description': log.get('act_description'),
                'staff_name': log.get('staff_name', ''),
                # Extras (not currently used by UI but helpful for filters)
                'act_module': (log.get('act_module') or ''),
                'act_action': (log.get('act_action') or ''),
                'act_record_id': log.get('act_record_id'),
            }
            for log in activity_logs_serialized
        ]

        # Search filter with safe string handling
        search = request.query_params.get('search', '').strip().lower()
        if search:
            mapped_logs = [
                log for log in mapped_logs
                if search in (log.get('act_type', '') or '').lower()
                or search in (log.get('act_description', '') or '').lower()
                or search in (log.get('staff_name', '') or '').lower()
                or search in (log.get('act_module', '') or '').lower()
                or search in (log.get('act_action', '') or '').lower()
            ]

        # Sort by timestamp (newest first)
        sorted_logs = sorted(mapped_logs, key=itemgetter('act_timestamp'), reverse=True)
        return Response(sorted_logs)
    
    def get_queryset(self):
        # Return all activity logs; access control can be layered via permissions if needed
        return ActivityLog.objects.all()
