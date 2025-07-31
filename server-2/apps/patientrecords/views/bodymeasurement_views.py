from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from datetime import datetime
from django.db.models import Count, Prefetch
from django.http import Http404
from apps.healthProfiling.models import PersonalAddress
from apps.healthProfiling.models import ResidentProfile
from apps.healthProfiling.serializers.resident_profile_serializers import ResidentProfileListSerializer
from ..utils import *
from ..models import BodyMeasurement
from ..serializers.bodymesurement_serializers import BodyMeasurementSerializer



class BodyMeasurementView(generics.ListCreateAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
class DeleteUpdateBodyMeasurementView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BodyMeasurementSerializer
    queryset = BodyMeasurement.objects.all()
    lookup_field = 'bmi_id'
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            return Response({"error": "Body measurement record not found."}, status=status.HTTP_404_NOT_FOUND)


class GetPreviousHeightWeightAPIView(APIView):
    def get(self, request, pat_id):
        result = get_latest_height_weight(pat_id)

        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "No previous height/weight found."},
                status=status.HTTP_404_NOT_FOUND
            )
    