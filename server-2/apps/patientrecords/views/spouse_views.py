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
from ..models import Spouse
from ..serializers.spouse_serializers import SpouseSerializer, SpouseCreateSerializer

class SpouseCreateView(generics.CreateAPIView):
    serializer_class = SpouseCreateSerializer

    def create(self, request, *args, **kwargs):
        required_fields = ['spouse_lname', 'spouse_fname', 'spouse_occupation', 'rp_id']

        for field in required_fields:
            if not request.data.get(field):
                return Response(
                    {'error': 'f{field} is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if 'spouse_dob' not in request.data:
            request.data['spouse_dob'] = None
        
        return super().create(request, *args, **kwargs)

class SpouseListView(generics.ListAPIView):
    serializer_class = SpouseSerializer

    def get_queryset(self):
        rp_id = self.request.query_params.get('rp_id')

        if rp_id:
            return Spouse.objects.filter(rp_id=rp_id)
        return Spouse.objects.all()

class SpouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SpouseSerializer
    queryset = Spouse.objects.all()
    lookup_field = 'spouse_id'
    
# class SpouseRetrieveDeleteUpdate(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = SpouseSerializer
#     queryset = Spouse.objects.all()
#     lookup_field = 'spouse_id'

#     def get_object(self):
#         spouse_id = self.kwargs.get('spouse_id')
#         return get_object_or_404(Spouse, spouse_id=spouse_id)

        