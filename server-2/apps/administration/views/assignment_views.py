from rest_framework import generics
from django.shortcuts import get_object_or_404
from ..models import Assignment
from ..serializers.assignment_serializers import *

class AssignmentView(generics.ListCreateAPIView):
    serializer_class = AssignmentMinimalSerializer
    queryset = Assignment.objects.all()

class AssignmentFilteredView(generics.ListAPIView):
    serializer_class = AssignmentMinimalSerializer
    
    def get_queryset(self):
        pos = self.kwargs.get('pos')
        return Assignment.objects.filter(pos=pos)

class AssignmentCreateView(generics.CreateAPIView):
    serializer_class = AssignmentBaseSerializer
    queryset = Assignment.objects.all()

class AssignmentDeleteView(generics.DestroyAPIView):
    serializer_class = AssignmentBaseSerializer
    queryset = Assignment.objects.all()
    
    def get_object(self):
        feat_id = self.kwargs.get('feat')
        pos_id = self.kwargs.get('pos')

        obj = get_object_or_404(Assignment, feat_id=feat_id, pos_id=pos_id)
        return obj