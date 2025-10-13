from .summonsSerializers import *
from django.db.models import Prefetch, Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
from apps.pagination import StandardResultsPagination
from apps.treasurer.serializers import Purpose_And_RatesSerializers
from apps.treasurer.models import Purpose_And_Rates

# ===================== COUNCIL MEDIATION / CONCILIATION PROCEEDINGS ========================
class LuponCasesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCasesSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = SummonCase.objects.filter(
            sc_conciliation_status__isnull=False
        ).exclude(
            sc_conciliation_status__exact=''
        ).select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintcomplainant_set__cpnt__rp_id'),
            Prefetch('comp_id__complaintaccused_set__acsd'),
            Prefetch('hearing_schedules'),
            Prefetch('hearing_schedules__hearing_minutes'),
            Prefetch('hearing_schedules__remark'),
            Prefetch('hearing_schedules__remark__supporting_documents')
        )

        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter and status_filter.lower() != 'all':
            queryset = queryset.filter(
                sc_conciliation_status__iexact=status_filter
            )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(sc_code__icontains=search_query) |
                Q(comp_id__comp_incident_type__icontains=search_query) |
                Q(comp_id__comp_location__icontains=search_query) |
                Q(comp_id__comp_allegation__icontains=search_query) |
                Q(comp_id__complaintcomplainant__cpnt__cpnt_name__icontains=search_query) |
                Q(comp_id__complaintaccused__acsd__acsd_name__icontains=search_query)
            ).distinct()

        return queryset.order_by('sc_code')

class CouncilMediationCasesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCasesSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = SummonCase.objects.all().select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintcomplainant_set__cpnt__rp_id'),
            Prefetch('comp_id__complaintaccused_set__acsd'),
            Prefetch('hearing_schedules'),
            Prefetch('hearing_schedules__hearing_minutes'),
            Prefetch('hearing_schedules__remark'),
            Prefetch('hearing_schedules__remark__supporting_documents')
        )

        # Status filter - only use sc_mediation_status
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter and status_filter.lower() != 'all':
            queryset = queryset.filter(sc_mediation_status__iexact=status_filter)

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(sc_code__icontains=search_query) |
                Q(comp_id__comp_incident_type__icontains=search_query) |
                Q(comp_id__comp_location__icontains=search_query) |
                Q(comp_id__comp_allegation__icontains=search_query) |
                Q(comp_id__complaintcomplainant__cpnt__cpnt_name__icontains=search_query) |
                Q(comp_id__complaintaccused__acsd__acsd_name__icontains=search_query)
            ).distinct()

        return queryset.order_by('sc_code')

class SummonCasesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCasesSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = SummonCase.objects.all().select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintcomplainant_set__cpnt__rp_id'),
            Prefetch('comp_id__complaintaccused_set__acsd'),
            Prefetch('hearing_schedules'),
            Prefetch('hearing_schedules__hearing_minutes'),
            Prefetch('hearing_schedules__remark'),
            Prefetch('hearing_schedules__remark__supporting_documents')
        )

        # Status filter for remarks (combined logic)
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter and status_filter.lower() != 'all':
            # Combined logic: if conciliation_status is null, use mediation_status, otherwise use conciliation_status
            queryset = queryset.filter(
                Q(sc_conciliation_status__isnull=True, sc_mediation_status__iexact=status_filter) |
                Q(sc_conciliation_status__isnull=False, sc_conciliation_status__iexact=status_filter)
            )

        # Search functionality - FIXED VERSION
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            # Search across summon case fields and related complaint fields
            queryset = queryset.filter(
                Q(sc_code__icontains=search_query) |
                Q(comp_id__comp_incident_type__icontains=search_query) |
                Q(comp_id__comp_location__icontains=search_query) |
                Q(comp_id__comp_allegation__icontains=search_query) |
                Q(comp_id__complaintcomplainant__cpnt__cpnt_name__icontains=search_query) |
                Q(comp_id__complaintaccused__acsd__acsd_name__icontains=search_query)
            ).distinct()

        return queryset.order_by('sc_code')

    
class SummonCaseDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCaseDetailSerializer
    queryset = SummonCase.objects.all().prefetch_related(
        'hearing_schedules',  # Now uses the related_name
        'hearing_schedules__remark',
        'hearing_schedules__remark__supporting_documents',
        'hearing_schedules__hearing_minutes',
        'hearing_schedules__sd_id',
        'hearing_schedules__st_id'
    )
    lookup_field = 'sc_id'
    lookup_url_kwarg = 'sc_id'


class CouncilCaseDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCaseDetailSerializer
    queryset = SummonCase.objects.all().prefetch_related(
        Prefetch(
            'hearing_schedules',
            queryset=HearingSchedule.objects.filter(
                hs_level__icontains='Mediation'
            )
        ),
        'hearing_schedules__remark',
        'hearing_schedules__remark__supporting_documents',
        'hearing_schedules__hearing_minutes',
        'hearing_schedules__sd_id',
        'hearing_schedules__st_id'
    )
    lookup_field = 'sc_id'
    lookup_url_kwarg = 'sc_id'


class LuponCaseDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCaseDetailSerializer
    queryset = SummonCase.objects.all().prefetch_related(
        Prefetch(
            'hearing_schedules',
            queryset=HearingSchedule.objects.filter(
                hs_level__icontains='Conciliation Proceedings'
            )
        ),
        'hearing_schedules__remark',
        'hearing_schedules__remark__supporting_documents',
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
    
class RemarkView(generics.ListCreateAPIView):
    serializer_class = RemarkSerializer
    queryset = Remark.objects.all()

class RemarkSuppDocCreateView(generics.ListCreateAPIView):
    serializer_class = RemarkSuppDocCreateSerializer
    queryset = RemarkSuppDocs.objects.all()

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

# =================== PAYMENT REQ =========================

class ServiceChargePaymentReqView(generics.ListCreateAPIView):
    serializer_class = ServiceChargePaymentReqSerializer
    queryset = ServiceChargePaymentRequest.objects.all()


class FileActionIdView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    
    def get_object(self):
        return Purpose_And_Rates.objects.filter(
            pr_purpose="File Action", 
            pr_is_archive=False
        ).order_by('-pr_date').first()