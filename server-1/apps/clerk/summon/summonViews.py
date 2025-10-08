from .summonsSerializers import *
from django.db.models import Prefetch
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin


# ===================== COUNCIL MEDIATION / CONCILIATION PROCEEDINGS ========================
class SummonCasesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCasesSerializer

    def get_queryset(self):
        queryset = SummonCase.objects.all().select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintcomplainant_set__cpnt__rp_id'),  # Add this
            Prefetch('comp_id__complaintaccused_set__acsd')
        )
        
        return queryset.order_by('sc_code')

class SummonCaseDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCaseDetailSerializer
    queryset = SummonCase.objects.all().prefetch_related(
        'hearing_schedules',  # Now uses the related_name
        'hearing_schedules__remarks',
        'hearing_schedules__remarks__supporting_documents',
        'hearing_schedules__hearing_minutes',
        'hearing_schedules__sd_id',
        'hearing_schedules__st_id'
    )
    lookup_field = 'sc_id'
    lookup_url_kwarg = 'sc_id'

class UpdateSummonCaseView(generics.UpdateAPIView):
    serializer_class = SummonCaseSerializer
    queryset = SummonCase.objects.all()
    lookup_field = 'sc_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class HearingScheduleView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = HearingScheduleSerializer
    queryset = HearingSchedule.objects.all()

class HearingMinutesCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = HearingMinutesCreateSerializer
    queryset = HearingMinutes.objects.all()

class UpdateHearingScheduleView(generics.UpdateAPIView):
    serializer_class = HearingScheduleSerializer
    queryset = HearingSchedule.objects.all()
    lookup_field = 'hs_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class HearingScheduleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = HearingScheduleDetailSerializer  
    
    def get_queryset(self):
        sc_id = self.kwargs['sc_id']  
        return HearingSchedule.objects.filter(
            sc_id=sc_id  
        ).select_related(
            'sc_id',     
            'sd_id',
            'st_id'
        ).order_by('sd_id__sd_date', 'st_id__st_start_time')
    

# ======================== SUMMON DATE AND TIME ========================
class SummonDateAvailabilityView(generics.ListCreateAPIView):
    serializer_class = SummonDateAvailabilitySerializer
    queryset = SummonDateAvailability.objects.all()


class DeleteSummonDateAvailability(generics.RetrieveDestroyAPIView):
    queryset = SummonDateAvailability.objects.all()
    serializer_class = SummonDateAvailabilitySerializer
    lookup_field = 'sd_id'

class SummonTimeAvailabilityView(generics.ListCreateAPIView):
    serializer_class = SummonTimeAvailabilitySerializer
    queryset = SummonTimeAvailability.objects.all()

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            SummonTimeAvailability.objects.bulk_create([
                SummonTimeAvailability(**data) for data in serializer.validated_data
            ])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)

class SummonTimeAvailabilityByDateView(generics.ListAPIView):
    serializer_class = SummonTimeAvailabilitySerializer

    def get_queryset(self):
        sd_id = self.kwargs.get('sd_id')  # get from URL path
        queryset = SummonTimeAvailability.objects.all()
        if sd_id is not None:
            queryset = queryset.filter(sd_id=sd_id)
        return queryset

class DeleteSummonTimeAvailabilityView(generics.RetrieveDestroyAPIView):
    queryset = SummonTimeAvailability.objects.all()
    serializer_class = SummonTimeAvailabilitySerializer
    lookup_field = 'st_id'


class UpdateSummonTimeAvailabilityView(generics.UpdateAPIView):
    serializer_class = SummonTimeAvailabilitySerializer
    queryset = SummonTimeAvailability.objects.all()
    lookup_field = 'st_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
