from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Count, F
from ..models import Position, Staff
from ..serializers.position_serializers import *
from ..double_queries import PostQueries


class PositionView(generics.ListCreateAPIView):
    serializer_class = PositionListSerializer

    def get_queryset(self):
        staff_type = self.request.query_params.get('staff_type', None)
        
        if staff_type:
            pos_category = 'Barangay Position' if staff_type == 'Barangay Staff' \
                            else 'Health Position'
            queryset = Position.objects.filter(pos_category=pos_category)
            return queryset
        return None
    
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
            # Perform double query
            double_queries = PostQueries()
            response = double_queries.position(request.data)
            if not response.ok:
                try:
                    error_detail = response.json()
                except ValueError:
                    error_detail = response.text
                raise serializers.ValidationError({"error": error_detail})
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
        return Response(status=status.HTTP_404_NOT_FOUND)