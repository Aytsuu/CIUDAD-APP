from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..serializers.personal_serializers import *
from ..models import *
from rest_framework.permissions import AllowAny

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


class HealthRelatedDetailsCreateView(generics.CreateAPIView):
    queryset = HealthRelatedDetails.objects.all()
    serializer_class = HealthRelatedDetailsSerializer

class PersonalModificationCreateView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    personal = request.data.get("personal", None)
    print(personal)
    if not personal:
      return Response(status=status.HTTP_400_BAD_REQUEST)

    request = PersonalModification(
      pm_fname=personal.get('per_fname', None),
      pm_lname=personal.get('per_lname', None),
      pm_mname=personal.get('per_mname', None),
      pm_suffix=personal.get('per_suffix', None),
      pm_dob=personal.get('per_dob', None),
      pm_sex=personal.get('per_sex', None),
      pm_status=personal.get('per_status', None),
      pm_edAttainment=personal.get('per_edAttainment', None),
      pm_religion=personal.get('per_religion', None),
      pm_contact=personal.get('per_contact', None),
      per=Personal.objects.get(per_id=personal.get('per_id', None))
    )
    request.save()

    return Response(status=status.HTTP_200_OK)

class PersonalModificationRequestsView(generics.RetrieveAPIView):
  serializer_class = PersonalModificationBaseSerializer
  queryset = PersonalModification.objects.all()
  lookup_field = 'per'
  
