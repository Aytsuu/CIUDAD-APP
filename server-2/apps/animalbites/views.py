from django.shortcuts import render
from rest_framework import generics,status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response

class AnimalbiteRecordsView(generics.ListAPIView):
    serializer_class = AnimalBiteRecordSerializer
    queryset = AnimalBite_Referral.objects.all()
    
    
class AnimalbiteDetailsView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteDetailsSerializer
    queryset = AnimalBite_Details.objects.all()
    
    def get(self, request):
        animal_bite_patients = AnimalBite_Details.objects.filter(
            referral__patrec__patrec_type="Animal Bites"
        )
        serializer = AnimalBiteDetailsSerializer(animal_bite_patients, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AnimalbiteReferralView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteReferralSerializer
    queryset = AnimalBite_Referral.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

class AnimalbiteBitingAnimalView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteBitingAnimalSerializer
    queryset = BitingAnimal.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class AnimalbiteExposureSiteView(generics.ListCreateAPIView):
    serializer_class = AnimalBiteExposureSiteSerializer
    queryset = ExposureSite.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
