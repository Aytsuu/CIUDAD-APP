from rest_framework import generics
from ..models import Feature
from ..serializers.feature_serializers import *

class FeatureView(generics.ListCreateAPIView):
    serializer_class = FeatureBaseSerializer

    def get_queryset(self):
        category = self.request.query_params.get("category", None)
        if category:
            queryset = Feature.objects.filter(feat_category=category)
            both = Feature.objects.filter(feat_category="BOTH")
            return queryset | both
        return None
    
class FeatureDataView(generics.RetrieveAPIView):
    serializer_class = FeatureBaseSerializer
    queryset = Feature.objects.all()
    lookup_field = 'feat'
