from .summonsSerializers import *
from django.db.models import Prefetch, Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
from apps.pagination import StandardResultsPagination
from apps.treasurer.serializers import Purpose_And_RatesSerializers
from apps.treasurer.models import Purpose_And_Rates
from rest_framework.views import APIView
from apps.complaint.serializers import ComplaintSerializer
from rest_framework import status
from django.shortcuts import get_object_or_404

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

class SummonCasesView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonCasesSerializer
    pagination_class = StandardResultsPagination

    def perform_create(self, serializer):
        instance = serializer.save()
        
        # Custom activity logging for summon case creation
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            # Get staff member from request
            staff_id = self.request.data.get('staff_id') or '00005250821'  # Default staff ID
            staff = Staff.objects.filter(staff_id=staff_id).first()
            
            if staff:
                # Get complaint details for better description
                complaint_info = "Unknown Complaint"
                if instance.comp_id:
                    complaint_info = f"Complaint #{instance.comp_id.comp_id}"
                    if instance.comp_id.comp_incident_type:
                        complaint_info += f" - {instance.comp_id.comp_incident_type}"
                
                create_activity_log(
                    act_type="Summon Case Created",
                    act_description=f"New summon case {instance.sc_code} created for {complaint_info}",
                    staff=staff,
                    record_id=instance.sc_code
                )
                
        except Exception as log_error:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to log activity for summon case creation: {str(log_error)}")
            # Don't fail the request if logging fails
        
        return instance

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
    queryset = SummonCase.objects.all().select_related(
        'staff_id__rp__per'
    ).prefetch_related(
        Prefetch(
            'hearing_schedules',
            queryset=HearingSchedule.objects.all().order_by('hs_id')
        ),
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
    queryset = SummonCase.objects.all().select_related(
        'staff_id__rp__per'
    ).prefetch_related(
        Prefetch(
            'hearing_schedules',
            queryset=HearingSchedule.objects.filter(
                hs_level__icontains='Mediation' 
            ).order_by('hs_id') 
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
    queryset = SummonCase.objects.all().select_related(
        'staff_id__rp__per'
    ).prefetch_related(
        Prefetch(
            'hearing_schedules',
            queryset=HearingSchedule.objects.filter(
                hs_level__icontains='Conciliation Proceedings'
            ).order_by('hs_id') 
        ),
        'hearing_schedules__remark',
        'hearing_schedules__remark__supporting_documents',
        'hearing_schedules__hearing_minutes',
        'hearing_schedules__sd_id',
        'hearing_schedules__st_id'
    )
    lookup_field = 'sc_id'
    lookup_url_kwarg = 'sc_id'

class UpdateSummonCaseView(ActivityLogMixin, generics.UpdateAPIView):
    serializer_class = SummonCaseSerializer
    permission_classes = [AllowAny]
    queryset = SummonCase.objects.all()
    lookup_field = 'sc_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.sc_mediation_status
        old_conciliation_status = instance.sc_conciliation_status
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Custom activity logging for status changes
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member from request
                staff_id = request.data.get('staff_id') or '00005250821'  # Default staff ID
                staff = Staff.objects.filter(staff_id=staff_id).first()
                
                if staff:
                    new_status = instance.sc_mediation_status
                    new_conciliation_status = instance.sc_conciliation_status
                    
                    # Log mediation status change
                    if old_status != new_status:
                        create_activity_log(
                            act_type="Summon Case Mediation Status Updated",
                            act_description=f"Summon case {instance.sc_code} mediation status changed from '{old_status}' to '{new_status}'",
                            staff=staff,
                            record_id=instance.sc_code
                        )
                    
                    # Log conciliation status change
                    if old_conciliation_status != new_conciliation_status:
                        create_activity_log(
                            act_type="Summon Case Conciliation Status Updated",
                            act_description=f"Summon case {instance.sc_code} conciliation status changed from '{old_conciliation_status}' to '{new_conciliation_status}'",
                            staff=staff,
                            record_id=instance.sc_code
                        )
                    
                    # Log general update if no specific status changes
                    if old_status == new_status and old_conciliation_status == new_conciliation_status:
                        create_activity_log(
                            act_type="Summon Case Updated",
                            act_description=f"Summon case {instance.sc_code} details updated",
                            staff=staff,
                            record_id=instance.sc_code
                        )
                        
            except Exception as log_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to log activity for summon case update: {str(log_error)}")
                # Don't fail the request if logging fails
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class HearingScheduleView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = HearingScheduleSerializer
    queryset = HearingSchedule.objects.all()

class HearingMinutesCreateView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = HearingMinutesCreateSerializer
    queryset = HearingMinutes.objects.all()

class UpdateHearingScheduleView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
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
        ).order_by('hs_id')
    
class RemarkView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RemarkSerializer
    queryset = Remark.objects.all()

class RemarkSuppDocCreateView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RemarkSuppDocCreateSerializer
    queryset = RemarkSuppDocs.objects.all()

# ======================== SUMMON DATE AND TIME ========================
class SummonDateAvailabilityView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummonDateAvailabilitySerializer
    queryset = SummonDateAvailability.objects.all()

class DeleteSummonDateAvailability(ActivityLogMixin, generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = SummonDateAvailability.objects.all()
    serializer_class = SummonDateAvailabilitySerializer
    lookup_field = 'sd_id'

class SummonTimeAvailabilityView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = SummonTimeAvailabilitySerializer

    def get_queryset(self):
        sd_id = self.kwargs.get('sd_id')  # get from URL path
        queryset = SummonTimeAvailability.objects.all()
        if sd_id is not None:
            queryset = queryset.filter(sd_id=sd_id)
        return queryset

class DeleteSummonTimeAvailabilityView(ActivityLogMixin, generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = SummonTimeAvailability.objects.all()
    serializer_class = SummonTimeAvailabilitySerializer
    lookup_field = 'st_id'


class UpdateSummonTimeAvailabilityView(ActivityLogMixin, generics.UpdateAPIView):
    permission_classes = [AllowAny]
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

class ServiceChargePaymentReqView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
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
    

# ================== ANALYTICS =======================

class ConciliationAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        counts = {
            'waiting': SummonCase.objects.filter(sc_conciliation_status__iexact='waiting for schedule').count(),
            'ongoing': SummonCase.objects.filter(sc_conciliation_status__iexact='ongoing').count(),
            'escalated': SummonCase.objects.filter(sc_conciliation_status__iexact='escalated').count(),
            'resolved': SummonCase.objects.filter(sc_conciliation_status__iexact='resolved').count(),
            'total': SummonCase.objects.count()
        }
        
        return Response(counts, status=status.HTTP_200_OK)
    
class MediationAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        counts = {
            'waiting': SummonCase.objects.filter(sc_mediation_status__iexact='waiting for schedule').count(),
            'ongoing': SummonCase.objects.filter(sc_mediation_status__iexact='ongoing').count(),
            'forwarded': SummonCase.objects.filter(sc_mediation_status__iexact='forwarded to lupon').count(),
            'resolved': SummonCase.objects.filter(sc_mediation_status__iexact='resolved').count(),
            'total': SummonCase.objects.count()
        }
        
        return Response(counts, status=status.HTTP_200_OK)
    

class SummonRemarksAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        try:
            no_remarks_count = HearingSchedule.objects.filter(remark__isnull=True).count()
            
            return Response({
                'no_remarks_count': no_remarks_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in hearing schedule analytics: {e}")
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

# ============== RESIDENT SIDE CASE TRACKING VIEW ==================
class CaseTrackingView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, comp_id):
        try:
            complaint = Complaint.objects.get(comp_id=comp_id)
            serializer_class = CaseTrackingSerializer(complaint)
            
            return Response(serializer_class.data)
            
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class SummonPaymentLogsView(generics.ListAPIView):
    serializer_class = ServiceChargePaymentReqSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        comp_id = self.kwargs.get('comp_id')  
        return ServiceChargePaymentRequest.objects.filter(
            comp_id=comp_id,
            pay_sr_type='Summon'
        )

class FileActionPaymentLogsView(generics.ListAPIView):
    serializer_class = ServiceChargePaymentReqSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        comp_id = self.kwargs.get('comp_id')  
        return ServiceChargePaymentRequest.objects.filter(
            comp_id=comp_id,
            pay_sr_type='File Action'
        )
    
# ============= COMPLAINT DETAIL VIEW ===============
class ComplaintDetailView(APIView):
    def get(self, request, comp_id, *args, **kwargs):  # Add comp_id as parameter
        if not comp_id:
            return Response(
                {'error': 'comp_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        complaint = get_object_or_404(
            Complaint.objects.prefetch_related(
                'complainant',  
                'accused',       
                'files',         
                'staff'          
            ),
            comp_id=comp_id
        )

        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# ============================= FOR CALENDAR ====================================
class CouncilMediationCalendarView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForCalendarSerializer

    def get_queryset(self):
        return SummonCase.objects.filter(
            ~(Q(sc_mediation_status__iexact='resolved') | Q(sc_mediation_status__iexact='forwarded to lupon')),
            (Q(sc_conciliation_status__isnull=True) | Q(sc_conciliation_status__exact='')),
            hearing_schedules__hs_is_closed=False,
            hearing_schedules__remark__isnull=False  
        ).select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintaccused_set__acsd'),
            Prefetch(
                'hearing_schedules',
                queryset=HearingSchedule.objects.filter(
                    hs_is_closed=False,
                    remark__isnull=False 
                ).select_related('sd_id', 'st_id')  
            )
        ).distinct()

class ConciliationProceedingsCalendarView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ForCalendarSerializer

    def get_queryset(self):
        return SummonCase.objects.filter(
            Q(sc_mediation_status__iexact='forwarded to lupon') &  
            ~(Q(sc_conciliation_status__iexact='resolved') | Q(sc_conciliation_status__iexact='escalated')),  
            hearing_schedules__hs_is_closed=False,
            hearing_schedules__remark__isnull=False  
        ).select_related(
            'comp_id'
        ).prefetch_related(
            Prefetch('comp_id__complaintcomplainant_set__cpnt'),
            Prefetch('comp_id__complaintaccused_set__acsd'),
            Prefetch(
                'hearing_schedules',
                queryset=HearingSchedule.objects.filter(
                    hs_is_closed=False,
                    remark__isnull=False 
                ).select_related('sd_id', 'st_id')  
            )
        ).distinct()