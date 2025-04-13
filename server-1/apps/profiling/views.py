from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import *
from .serializers.base import *
from .serializers.minimal import *
from .serializers.full import *

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

# Family Views ------------------------------------------------------------------------
class FamilyView(generics.ListCreateAPIView):
    serializer_class = FamilyFullSerializer
    queryset = Family.objects.all()

# Family Composition Views ------------------------------------------------------------
class FamilyCompositionView(generics.ListCreateAPIView):
    serializer_class = FamilyCompositionFullSerializer
    queryset = FamilyComposition.objects.all()

class FamilyCompositionDeleteView(generics.DestroyAPIView):
    serializer_class = FamilyCompositionSerializer
    queryset = FamilyComposition.objects.all()
    
    def get_object(self):
        fam_id = self.kwargs.get('fam')
        rp_id = self.kwargs.get('rp')

        obj = get_object_or_404(FamilyComposition, fam_id=fam_id, rp_id=rp_id)
        return obj

# Sitio Views --------------------------------------------------------------------------
class SitioView(generics.ListCreateAPIView):
    serializer_class = SitioSerializer
    queryset = Sitio.objects.all()

# Household Views ------------------------------------------------------------------------
class HouseholdView(generics.ListCreateAPIView):
    serializer_class = HouseholdFullSerializer
    queryset = Household.objects.all()  

# ResidentProfile Views -----------------------------------------------------------------
class ResidentProfileView(generics.ListCreateAPIView):
    serializer_class = ResidentProfileFullSerializer
    queryset = ResidentProfile.objects.all()    

# Request Views --------------------------------------------------------------------------

class RequestRegistrationView(generics.ListCreateAPIView):
    serializer_class = RequestRegistrationSerializer
    queryset = RequestRegistration.objects.all()

class RequestDeleteView(generics.DestroyAPIView):
    serializer_class = RequestRegistrationSerializer
    queryset = RequestRegistration.objects.all()
    lookup_field = 'req_id'

# Business Views --------------------------------------------------------------------------
class BusinessView(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer
    queryset = Business.objects.all()

class BusinessFileView(generics.ListCreateAPIView):
    serializer_class = BusinessFileSerializer
    queryset = BusinessFile.objects.all()