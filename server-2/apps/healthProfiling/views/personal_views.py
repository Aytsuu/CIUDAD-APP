from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..serializers.personal_serializers import *
from ..models import *
from rest_framework.permissions import AllowAny

class PersonalCreateView(APIView):
  permission_classes = [AllowAny]

  def post(self, request, *args, **kwargs):
    personal = request.data
    addresses = personal.pop("per_addresses", None)
    add_instances = [
      Address.objects.get_or_create(
        add_province=add["add_province"],
        add_city=add["add_city"],
        add_barangay = add["add_barangay"],
        sitio=Sitio.objects.filter(sitio_name=add["sitio"]).first(),
        add_external_sitio=add["add_external_sitio"],
        add_street=add["add_street"]
      )[0]
      for add in addresses
    ]

    # Create Personal record
    per_instance = Personal(**personal)
    per_instance._history_user = None
    per_instance.save()

    try:
      latest_history = per_instance.history.latest()
      history_id = latest_history.history_id
    except per_instance.history.model.DoesNotExist:
      history_id = None  

    for add in add_instances:
      PersonalAddress.objects.create(add=add, per=per_instance) 
      history = PersonalAddressHistory(add=add, per=per_instance)
      history.history_id=history_id
      history.save()

    return Response(status=status.HTTP_200_OK)

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
  
