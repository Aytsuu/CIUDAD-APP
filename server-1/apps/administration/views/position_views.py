from rest_framework import generics, status
from rest_framework.response import Response
from ..models import Position, Staff
from ..serializers.position_serializers import *

class PositionView(generics.ListCreateAPIView):
    serializer_class = PositionBaseSerializer
    queryset = Position.objects.all()
    
class PositionDeleteView(generics.DestroyAPIView):
    serializer_class = PositionBaseSerializer
    queryset = Position.objects.all()
    lookup_field = 'pos_id'

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