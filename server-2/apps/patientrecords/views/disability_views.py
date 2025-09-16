# from django.shortcuts import render
# from rest_framework import generics, status
# from rest_framework.views import APIView
# from rest_framework.exceptions import NotFound
# from rest_framework.decorators import api_view
# from django.shortcuts import get_object_or_404
# from rest_framework.response import Response
# from datetime import datetime
# from django.db.models import Count, Prefetch
# from django.http import Http404
# from ..models import ListOfDisabilities, PatientDisablity
# from ..serializers.disability_serializers import  PatientDisabilitySerializer, ListDisabilitySerializer
# from rest_framework.response import Response


# class ListDisabilityView(generics.ListCreateAPIView):
#     serializer_class = ListDisabilitySerializer
#     queryset = ListOfDisabilities.objects.all()
    


# class PatientDisabilityView(generics.ListCreateAPIView):
#     serializer_class = PatientDisabilitySerializer
#     queryset = PatientDisablity.objects.all()

#     def create(self, request, *args, **kwargs):
#         patrec_id = request.data.get("patrec")
#         disability_ids = request.data.get("disabilities", [])

#         if not patrec_id or not isinstance(disability_ids, list):
#             return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

#         instances = []
#         for disability_id in disability_ids:
#             instances.append(PatientDisablity(patrec_id=patrec_id, disability_id=disability_id))

#         PatientDisablity.objects.bulk_create(instances)

#         serializer = self.get_serializer(instances, many=True)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     def patch(self, request, *args, **kwargs):
#         """
#         Bulk partial update (PATCH) of multiple PatientDisability records.
#         """
#         data = request.data

#         if not isinstance(data, list):
#             return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

#         instances_to_update = []
#         for item in data:
#             obj_id = item.get("id")
#             if not obj_id:
#                 continue

#             try:
#                 instance = PatientDisablity.objects.get(id=obj_id)
#             except PatientDisablity.DoesNotExist:
#                 continue

#             # Optional fields
#             if "disability_id" in item:
#                 instance.disability_id = item["disability_id"]
#             if "patrec_id" in item:
#                 instance.patrec_id = item["patrec_id"]
#             if "status" in item:
#                 instance.status = item["status"]  # <-- support status update

#             instances_to_update.append(instance)

#         PatientDisablity.objects.bulk_update(
#             instances_to_update,
#             ["disability_id", "patrec_id", "status"]
#         )

#         serializer = self.get_serializer(instances_to_update, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
