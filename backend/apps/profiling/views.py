from django.shortcuts import render
from rest_framework import generics
from .serializers import *

# Create your views here.
class PersonalView(generics.ListCreateAPIView):
    serializer_class = PersonalSerializer
    queryset = Personal.objects.all()

class MotherView(generics.ListCreateAPIView):
    serializer_class = MotherSerializer
    queryset = Mother.objects.all()

class FatherView(generics.ListCreateAPIView):
    serializer_class = FatherSerializer
    queryset = Father.objects.all()

class DependentView(generics.ListCreateAPIView):
    serializer_class = DependentSerializer
    queryset = Dependent.objects.all()

class FamilyView(generics.ListCreateAPIView):
    serializer_class = FamilySerializer
    queryset = Family.objects.all()

class FamilyCompositionView(generics.ListCreateAPIView):
    serializer_class = FamilyCompositionSerializer
    queryset = FamilyComposition.objects.all()

class SitioView(generics.ListCreateAPIView):
    serializer_class = SitioSerializer
    queryset = Sitio.objects.all()

class AddressView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    queryset = Address.objects.all()

class HouseholdView(generics.ListCreateAPIView):
    serializer_class = HouseholdSerializer
    queryset = Household.objects.all()

class BuildingView(generics.ListCreateAPIView):
    serializer_class = BuildingSerializer
    queryset = Building.objects.all()
