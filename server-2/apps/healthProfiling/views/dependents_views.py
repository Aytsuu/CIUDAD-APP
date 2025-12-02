from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Dependents_Under_Five
from ..serializers.dependents_serializers import DependentsUnderFiveSerializer


class DependentsUnderFiveCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = Dependents_Under_Five.objects.all()
    serializer_class = DependentsUnderFiveSerializer


class DependentsUnderFiveListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Dependents_Under_Five.objects.all()
    serializer_class = DependentsUnderFiveSerializer
