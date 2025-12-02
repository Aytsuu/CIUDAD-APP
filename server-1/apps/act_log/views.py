from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from apps.pagination import StandardResultsPagination


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = ActivityLog.objects.select_related('staff__rp__per').all()
        
        # Search functionality
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(act_type__icontains=search) |
                Q(act_description__icontains=search) |
                Q(staff__rp__per__per_lname__icontains=search) |
                Q(staff__rp__per__per_fname__icontains=search) |
                Q(staff__rp__per__per_mname__icontains=search) |
                Q(act_module__icontains=search) |
                Q(act_action__icontains=search)
            )
        
        # Activity type filter
        act_type = self.request.query_params.get('act_type', '').strip()
        if act_type:
            queryset = queryset.filter(act_type__icontains=act_type)
        
        return queryset.order_by('-act_timestamp')
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # Fallback for non-paginated requests
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )


class ActivityLogDetailView(generics.RetrieveAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [AllowAny]
    queryset = ActivityLog.objects.select_related('staff').all()
    
