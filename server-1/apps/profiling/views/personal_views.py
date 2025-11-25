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
      partial=True,
      context={'request': request}
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

# class PersonalModificationCreateView(APIView):
#   permission_classes = [AllowAny]
#   def post(self, request):
#     personal = request.data.get("personal", None)
#     per_addresses = personal.get('per_addresses', [])
#     if not personal:
#       return Response(status=status.HTTP_400_BAD_REQUEST)

#     mod_request = PersonalModification.objects.create(
#       pm_fname=personal.get('per_fname', None),
#       pm_lname=personal.get('per_lname', None),
#       pm_mname=personal.get('per_mname', None),
#       pm_suffix=personal.get('per_suffix', None),
#       pm_dob=personal.get('per_dob', None),
#       pm_sex=personal.get('per_sex', None),
#       pm_status=personal.get('per_status', None),
#       pm_edAttainment=personal.get('per_edAttainment', None),
#       pm_religion=personal.get('per_religion', None),
#       pm_contact=personal.get('per_contact', None),
#       per=Personal.objects.get(per_id=personal.get('per_id', None))
#     )

#     if len(per_addresses) > 0:
#       instances = [
#         PersonalAddressModification(
#           pm=mod_request,
#           add=Address.objects.get_or_create(
#             add_province=per_add['add_province'],
#             add_city=per_add['add_city'],
#             add_barangay=per_add['add_barangay'],
#             add_external_sitio=per_add['add_external_sitio'],
#             sitio=Sitio.objects.filter(sitio_name=per_add.get('sitio', None)).first(),
#             add_street=per_add['add_street'],
#           )[0]
#         ) 
#         for per_add in per_addresses
#       ]

#       PersonalAddressModification.objects.bulk_create(instances)

#     return Response(status=status.HTTP_200_OK)

# class PersonalModificationRequestsView(generics.ListAPIView):
#   serializer_class = PersonalModificationBaseSerializer

#   def get_queryset(self):
#     per = self.request.query_params.get('per', None)
#     queryset = PersonalModification.objects.all()

#     if per:
#       queryset = queryset.filter(per=per)
      
#     return queryset
  

