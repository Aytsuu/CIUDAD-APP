from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from ..serializers.personal_serializers import *
from ..models import *

class PersonalCreateView(generics.CreateAPIView):
  serializer_class = PersonalBaseSerializer
  queryset=Personal.objects.all()

  def perform_create(self, serializer):
    staff_id = self.request.data.pop('staff_id')
    
    if not staff_id:
        raise ValidationError({"staff_id": "Staff ID is required for history tracking"})

    try:
        staff = Staff.objects.get(staff_id=staff_id)
    except Staff.DoesNotExist:
        raise ValidationError({"staff_id": "Invalid staff ID"})

    # Save with history tracking
    serializer.save(
        _history_user=staff,
        _history_change_reason=f"Created by staff {staff_id}"
    )

class PersonalUpdateView(APIView):
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
  def get(self, request, *args, **kwargs):
    per_id = request.query_params.get('per_id', None)
    if per_id:
      query = Personal.history.filter(per_id=per_id)
    else:
      return Response(status=status.HTTP_404_NOT_FOUND)
      
    return Response(data=PersonalHistoryBaseSerializer(query, many=True).data, 
                    status=status.HTTP_200_OK)
