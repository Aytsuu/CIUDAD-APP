from rest_framework import generics
from ..models import Feature
from ..serializers.feature_serializers import *

class FeatureView(generics.ListCreateAPIView):
    serializer_class = FeatureBaseSerializer
    queryset = Feature.objects.all()
    
class FeatureDataView(generics.RetrieveAPIView):
    serializer_class = FeatureBaseSerializer
    queryset = Feature.objects.all()
    lookup_field = 'feat'