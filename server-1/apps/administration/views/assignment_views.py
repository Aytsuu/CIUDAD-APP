from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Assignment
from ..serializers.assignment_serializers import *
from ..double_queries import *

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(data=AssignmentMinimalSerializer(instance).data, status=status.HTTP_200_OK)

class AssignmentDeleteView(generics.DestroyAPIView):
    serializer_class = AssignmentBaseSerializer
    queryset = Assignment.objects.all()
    
    def get_object(self):
        feat_id = self.kwargs.get('feat')
        pos_id = self.kwargs.get('pos')

        obj = get_object_or_404(Assignment, feat_id=feat_id, pos_id=pos_id)

        double_queries = DeleteQueries()
        response = double_queries.assignment(feat_id, pos_id)
        if not response.ok:
            try:
                error_detail = response.json()
            except ValueError:
                error_detail = response.text
            raise serializers.ValidationError({'error': error_detail})
        return obj