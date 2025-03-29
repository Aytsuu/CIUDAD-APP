from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

# Personal Views ------------------------------------------------------------------------

class PersonalView(generics.ListCreateAPIView):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()

class PersonalUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()
    lookup_field = 'per_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Mother Views ------------------------------------------------------------------------

class MotherView(generics.ListCreateAPIView):
    serializer_class = MotherSerializer
    queryset = Mother.objects.all()

# Father Views ------------------------------------------------------------------------

class FatherView(generics.ListCreateAPIView):
    serializer_class = FatherSerializer
    queryset = Father.objects.all()

# Dependent Views ----------------------------------------------------------------------

class DependentView(generics.ListCreateAPIView):
    serializer_class = DependentSerializer
    queryset = Dependent.objects.all()

# Family Views ------------------------------------------------------------------------

class FamilyView(generics.ListCreateAPIView):
    serializer_class = FamilySerializer
    queryset = Family.objects.all()

# Family Composition Views ------------------------------------------------------------

class FamilyCompositionView(generics.ListCreateAPIView):
    serializer_class = FamilyCompositionSerializer
    queryset = FamilyComposition.objects.all()

# Sitio Views --------------------------------------------------------------------------

class SitioView(generics.ListCreateAPIView):
    serializer_class = SitioSerializer
    queryset = Sitio.objects.all()

# Household Views ------------------------------------------------------------------------

class HouseholdView(generics.ListCreateAPIView):
    serializer_class = HouseholdSerializer
    queryset = Household.objects.all()

# Building Views ------------------------------------------------------------------------

class BuildingView(generics.ListCreateAPIView):
    serializer_class = BuildingSerializer
    queryset = Building.objects.all()

# ResidentProfile Views -----------------------------------------------------------------

class ResidentProfileView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileFullSerializer
    queryset = ResidentProfile.objects.all()    

# Request Views --------------------------------------------------------------------------

class RequestView(generics.ListCreateAPIView):
    serializer_class = RequestSerializer
    queryset = Request.objects.all()

class RequestDeleteView(generics.DestroyAPIView):
    serializer_class = RequestSerializer
    queryset = Request.objects.all()
    lookup_field = 'req_id'