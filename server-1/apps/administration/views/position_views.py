from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from ..models import Position, Staff
from ..serializers.position_serializers import *

class PositionView(generics.ListCreateAPIView):
    serializer_class = PositionListSerializer
    
    def get_queryset(self):
        queryset = Position.objects.select_related('staff').all()
        
        # Add position group filtering
        pos_group = self.request.query_params.get('pos_group', '').strip()
        if pos_group:
            queryset = queryset.filter(pos_group=pos_group)
        
        # Add staff type filtering for role-based access
        staff_type = self.request.query_params.get('staff_type', '').strip()
        if staff_type and staff_type != 'Admin':
            # For non-admin users, filter positions:
            # 1. Show positions with matching pos_group
            # 2. Include non-grouped positions created by matching staff_type
            from django.db.models import Q
            
            if staff_type == 'Health Staff':
                queryset = queryset.filter(
                    Q(pos_group='HEALTH STAFFS') | 
                    Q(pos_group__isnull=True, staff__staff_type='Health Staff') |
                    Q(pos_group='', staff__staff_type='Health Staff')
                )
            elif staff_type == 'Barangay Staff':
                queryset = queryset.filter(
                    Q(pos_group='BARANGAY STAFFS') | 
                    Q(pos_group__isnull=True, staff__staff_type='Barangay Staff') |
                    Q(pos_group='', staff__staff_type='Barangay Staff')
                )
            
        return queryset
        
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PositionBaseSerializer
        return PositionListSerializer
    
class PositionDeleteView(generics.DestroyAPIView):
    serializer_class = PositionBaseSerializer
    queryset = Position.objects.all()
    lookup_field = 'pos_id'

class PositionBulkCreateView(generics.CreateAPIView):
    serializer_class = PositionBaseSerializer
    queryset = Position.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        instances = [
            Position(**item)
            for item in serializer.validated_data
        ]

        created_instances = Position.objects.bulk_create(instances)

        if len(created_instances) > 0:
            return Response(status=status.HTTP_201_CREATED)
        
        return Response(status=status.HTTP_400_BAD_REQUEST)

class PositionUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PositionBaseSerializer
    queryset = Position.objects.all()
    lookup_field = 'pos_id'

    def update(self, request, *args, **kwargs):
        max_holders = request.data['pos_max']
        pos = kwargs.get('pos_id')
        holders = Staff.objects.filter(pos=pos)
        
        if int(max_holders) >= len(holders):
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
class PositionGroupsListView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = Position.objects.filter(pos_group__isnull=False) \
                .exclude(pos_group__exact='') \
                .values_list('pos_group', flat=True) \
                .distinct()
        if queryset:
            return Response(queryset)
        return None