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