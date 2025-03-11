from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime

# Create your views here.

# Position Views ------------------------------------------------------------------------

class PositionView(generics.ListCreateAPIView):
    serializer_class = PositionSerializer
    queryset = Position.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class PositionDeleteView(generics.DestroyAPIView):
    serializer_class = FeatureSerializer
    queryset = Position.objects.all()
    lookup_field = 'pos_id'

# Feature Views ------------------------------------------------------------------------

class FeatureView(generics.ListCreateAPIView):
    serializer_class = FeatureSerializer
    queryset = Feature.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class FeatureDataView(generics.RetrieveAPIView):
    serializer_class = FeatureSerializer
    queryset = Feature.objects.all()
    lookup_field = 'feat'

# Assignment Views ------------------------------------------------------------------------

class AssignmentView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()

    def create(self, request, *args, **kwargs):
        print(request.data)
        return super().create(request, *args, **kwargs)
    
class AssignmentDeleteView(generics.DestroyAPIView):
    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()
    
    def get_object(self):
        feat_id = self.kwargs.get('feat')
        pos_id = self.kwargs.get('pos')

        obj = get_object_or_404(Assignment, feat_id=feat_id, pos_id=pos_id)
        return obj

# Permission Views ------------------------------------------------------------------------

class PermissionView(generics.ListCreateAPIView):
    serializer_class = PermissionSerializer
    queryset = Permission.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PermissionUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PermissionSerializer
    queryset = Permission.objects.all()
    lookup_field = 'assi'

    def get_object(self):
        assi = self.kwargs.get('assi')
        
        obj = get_object_or_404(Permission, assi=assi)
        return obj
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


