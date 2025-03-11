from django.shortcuts import render
from rest_framework import generics
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from datetime import datetime

# Create your views here.

class PositionView(generics.ListCreateAPIView):
    serializer_class = PositionSerializer
    queryset = Position.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class PositionDeleteView(generics.DestroyAPIView):
    serializer_class = FeatureSerializer
    queryset = Position.objects.all()
    lookup_field = 'pos_id'
    
class FeatureView(generics.ListCreateAPIView):
    serializer_class = FeatureSerializer
    queryset = Feature.objects.all()

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class FeatureDataView(generics.RetrieveAPIView):
    serializer_class = FeatureSerializer
    queryset = Feature.objects.all()
    lookup_field = 'feat'

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
