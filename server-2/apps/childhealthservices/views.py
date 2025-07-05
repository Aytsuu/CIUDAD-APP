from rest_framework import generics
from .serializers import (
    ChildHealthrecordSerializer,
    ChildHealthHistorySerializer,
    ChildHealthNotesSerializer,
    ChildHealthSupplementsSerializer,
    NutritionalStatusSerializer,
    ExclusiveBFCheckSerializer,
    ChildHealthImmunizationHistorySerializer
)

from .models import (
    ChildHealthrecord,
    ChildHealth_History,
    ChildHealthNotes,
    ChildHealthSupplements,
    NutritionalStatus,
    ExclusiveBFCheck,
    ChildHealthImmunizationHistory
)


class ChildHealthRecordsView(generics.ListCreateAPIView):
    queryset = ChildHealthrecord.objects.all()
    serializer_class = ChildHealthrecordSerializer


class ChildHealthHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealth_History.objects.all()
    serializer_class = ChildHealthHistorySerializer


class ChildHealthNotesView(generics.ListCreateAPIView):
    queryset = ChildHealthNotes.objects.all()
    serializer_class = ChildHealthNotesSerializer


class ChildHealthSupplementsView(generics.ListCreateAPIView):
    queryset = ChildHealthSupplements.objects.all()
    serializer_class = ChildHealthSupplementsSerializer


class NutritionalStatusView(generics.ListCreateAPIView):
    queryset = NutritionalStatus.objects.all()
    serializer_class = NutritionalStatusSerializer


class ExclusiveBFCheckView(generics.ListCreateAPIView):
    queryset = ExclusiveBFCheck.objects.all()
    serializer_class = ExclusiveBFCheckSerializer


class ChildHealthImmunizationHistoryView(generics.ListCreateAPIView):
    queryset = ChildHealthImmunizationHistory.objects.all()
    serializer_class = ChildHealthImmunizationHistorySerializer
