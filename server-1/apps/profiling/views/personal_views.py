from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..serializers.personal_serializers import *
from ..models import *

class PersonalCreateView(generics.CreateAPIView):
  permission_classes = [AllowAny]
  serializer_class = PersonalWithHistorySerializer
  queryset = Personal.objects.all()

class PersonalUpdateView(APIView):
  permission_classes = [AllowAny]
  def patch(self, request, pk):
    instance = get_object_or_404(Personal, pk=pk)
    serializer = PersonalUpdateSerializer(
      instance,
      data=request.data,
      partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=400)

class PersonalHistoryView(APIView):
  permission_classes = [AllowAny]
  def get(self, request, *args, **kwargs):
    per_id = request.query_params.get('per_id', None)
    if per_id:
      query = Personal.history.filter(per_id=per_id)
    else:
      return Response(status=status.HTTP_404_NOT_FOUND)
      
    return Response(data=PersonalHistoryBaseSerializer(query, many=True).data, 
                    status=status.HTTP_200_OK)
