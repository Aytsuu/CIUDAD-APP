from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import WasteTruck
from apps.profiling.models import Sitio
from rest_framework import generics
from .signals import archive_completed_hotspots
from rest_framework.permissions import AllowAny
from django.db.models import OuterRef, Subquery
from django.db.models import Q
from datetime import date, timedelta

# Create your views here.
#KANI 3RD

class WasteEventView(generics.ListCreateAPIView):
    serializer_class = WasteEventSerializer
    queryset = WasteEvent.objects.all()

class WasteCollectionStaffView(generics.ListCreateAPIView):
    serializer_class = WasteCollectionStaffSerializer
    queryset = WasteCollectionStaff.objects.all()

# WASTE COLLECTION RETRIEVE / VIEW
class WasteCollectionSchedView(generics.ListCreateAPIView):
    serializer_class = WasteCollectionSchedSerializer
    queryset = WasteCollectionSched.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        return instance  # Return the created instance including wc_num

# class WasteCollectionAssignmentView(generics.ListCreateAPIView):
#     serializer_class = WasteCollectionAssignmentSerializer
#     queryset = WasteCollectionAssignment.objects.all()

class WasteCollectorView(generics.ListCreateAPIView):
    serializer_class = WasteCollectorSerializer
    queryset = WasteCollector.objects.all()

class WasteCollectorListView(generics.ListAPIView):
    serializer_class = WasteCollectorSerializer
    
    def get_queryset(self):
        queryset = WasteCollector.objects.all()
        wc_num = self.request.query_params.get('wc_num')
        wstp = self.request.query_params.get('wstp')
        
        if wc_num:
            queryset = queryset.filter(wc_num=wc_num)
        if wstp:
            queryset = queryset.filter(wstp=wstp)
            
        return queryset

class WasteCollectionSchedFullDataView(generics.ListAPIView):
    serializer_class = WasteCollectionSchedFullDataSerializer
    queryset = WasteCollectionSched.objects.all()

class WasteCollectorDeleteView(generics.DestroyAPIView):
    queryset = WasteCollector.objects.all()
    serializer_class = WasteCollectorSerializer

    def get_object(self):
        wasc_id = self.kwargs.get('wasc_id')
        return get_object_or_404(WasteCollector, wasc_id=wasc_id) 

# WASTE COLLECTION DELETE
class WasteCollectionSchedDeleteView(generics.DestroyAPIView):
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer

    def get_object(self):
        wc_num = self.kwargs.get('wc_num')
        return get_object_or_404(WasteCollectionSched, wc_num=wc_num) 


    def perform_create(self, serializer):
        instance = serializer.save()
        return instance  # Return the created instance including wc_num

# class WasteCollectionAssignmentView(generics.ListCreateAPIView):
#     serializer_class = WasteCollectionAssignmentSerializer
#     queryset = WasteCollectionAssignment.objects.all()

class WasteCollectorView(generics.ListCreateAPIView):
    serializer_class = WasteCollectorSerializer
    queryset = WasteCollector.objects.all()

class WasteCollectorListView(generics.ListAPIView):
    serializer_class = WasteCollectorSerializer
    
    def get_queryset(self):
        queryset = WasteCollector.objects.all()
        wc_num = self.request.query_params.get('wc_num')
        wstp = self.request.query_params.get('wstp')
        
        if wc_num:
            queryset = queryset.filter(wc_num=wc_num)
        if wstp:
            queryset = queryset.filter(wstp=wstp)
            
        return queryset

class WasteCollectionSchedFullDataView(generics.ListAPIView):
    serializer_class = WasteCollectionSchedFullDataSerializer
    queryset = WasteCollectionSched.objects.all()

# WASTE COLLECTION UPDATE
class WasteCollectionSchedUpdateView(generics.RetrieveUpdateAPIView):
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer
    lookup_field = 'wc_num'
    permission_classes = [AllowAny]

class WasteCollectorDeleteView(generics.DestroyAPIView):
    queryset = WasteCollector.objects.all()
    serializer_class = WasteCollectorSerializer

    def get_object(self):
        wasc_id = self.kwargs.get('wasc_id')
        return get_object_or_404(WasteCollector, wasc_id=wasc_id) 

# WASTE COLLECTION DELETE
class WasteCollectionSchedDeleteView(generics.DestroyAPIView):
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer

    def get_object(self):
        wc_num = self.kwargs.get('wc_num')
        return get_object_or_404(WasteCollectionSched, wc_num=wc_num) 


#============================= WASTE HOTSPOT ================================

class UpcomingHotspotView(generics.ListAPIView):
    serializer_class = WasteHotspotSerializer

    def get_queryset(self):
        today = date.today()
        time_range = self.request.query_params.get('range', 'week')  # default to week
        
        queryset = WasteHotspot.objects.select_related(
            'wstp_id__staff__rp__per', 
            'sitio_id'
        ).filter(
            wh_is_archive=False,
            wh_date__gte=today
        )
        
        if time_range == 'today':
            queryset = queryset.filter(wh_date=today)
        else:  # week
            end_of_week = today + timedelta(days=7)
            queryset = queryset.filter(wh_date__lte=end_of_week)
            
        return queryset.order_by('wh_date', 'wh_start_time', 'wh_end_time')
    

# class UpdateHotspotView(generics.RetrieveUpdateAPIView): 
#     serializer_class = WasteHotspotSerializer
#     queryset = WasteHotspot.objects.all()
#     lookup_field = 'wh_num'

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class WasteHotspotView(generics.ListCreateAPIView):
    serializer_class = WasteHotspotSerializer

    def get_queryset(self):
        # archive_completed_hotspots()
        return WasteHotspot.objects.select_related(
            'wstp_id__staff__rp__per', 
            'sitio_id'                   
        ).all().order_by('wh_date', 'wh_start_time', 'wh_end_time')

class UpdateHotspotView(generics.RetrieveUpdateAPIView): 
    serializer_class = WasteHotspotSerializer
    queryset = WasteHotspot.objects.all()
    lookup_field = 'wh_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DeleteHotspotView(generics.DestroyAPIView):
    serializer_class = WasteHotspotSerializer    
    queryset = WasteHotspot.objects.all()

    def get_object(self):
        wh_num = self.kwargs.get('wh_num')
        return get_object_or_404(WasteHotspot, wh_num=wh_num) 


# ============================ ILLEGAL DUMPING ================================

class WasteReportFileView(generics.ListCreateAPIView):
    serializer_class = WasteReportFileSerializer
    queryset = WasteReport_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        rep_num = self.request.query_params.get('rep_num')
        if rep_num:
            queryset = queryset.filter(rep_num=rep_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        rep_id = request.query_params.get('rep_id') or request.data.get('rep_id')
        
        if not rep_id:
            return Response(
                {"error": "rep_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, rep_id=rep_id)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)   


class WasteReportDeleteFileView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = WasteReport_File.objects.all()
    serializer_class = WasteReportFileSerializer
    lookup_field = 'wrf_id' 
    

class WasteReportResolveFileView(generics.ListCreateAPIView):
    serializer_class = WasteReportResolveFileSerializer
    queryset = WasteReportResolve_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        rep_num = self.request.query_params.get('rep_num')
        if rep_num:
            queryset = queryset.filter(rep_num=rep_num)
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        rep_id = request.query_params.get('rep_id') or request.data.get('rep_id')
        
        if not rep_id:
            return Response(
                {"error": "rep_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, rep_id=rep_id)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)    

# class WasteReportView(generics.ListCreateAPIView):
#     serializer_class = WasteReportSerializer
#     queryset = WasteReport.objects.all()


class WasteReportView(generics.ListCreateAPIView):
    serializer_class = WasteReportSerializer
    def get_queryset(self):
        queryset = WasteReport.objects.all()
        rp_id = self.request.query_params.get('rp_id')
        
        if rp_id:
            # Filter by rp_id if provided
            queryset = queryset.filter(rp_id=rp_id)
        
        return queryset
    

class UpdateWasteReportView(generics.RetrieveUpdateAPIView):
    serializer_class = WasteReportSerializer
    queryset = WasteReport.objects.all()
    lookup_field = 'rep_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteWasteReportView(generics.DestroyAPIView):
    serializer_class = WasteReportSerializer    
    queryset = WasteReport.objects.all()

    def get_object(self):
        rep_id = self.kwargs.get('rep_id')
        return get_object_or_404(WasteReport, rep_id=rep_id) 


class WastePersonnelView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = WastePersonnelSerializer
    queryset = WastePersonnel.objects.all()
    filter_backends = [filters.SearchFilter]  
    filterset_fields = {
        'staff__pos__pos_title': ['exact', 'icontains'],  
        'staff__rp__per__per_lname': ['icontains'],  
        'staff__rp__per__per_fname': ['icontains'],  
    }
    search_fields = [
        'staff__rp__per__per_lname',
        'staff__rp__per__per_fname',
        'staff__pos__pos_title',
    ]
    
    def get_queryset(self):
        print("get_queryset called")
        queryset = super().get_queryset()
        queryset = queryset.select_related(
            'staff__pos',
            'staff__rp__per',
            'staff__manager__rp__per'
        )
        position = self.request.query_params.get('staff__pos__pos_title')
        if position:
            print("Filtering by position:", position)
            queryset = queryset.filter(staff__pos__pos_title=position)
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        minimal = request.query_params.get('minimal', '').lower() == 'true'
        if minimal:
            data = [{
                'wstp_id': p.wstp_id,
                'staff_id': p.staff.staff_id,
                'name': f"{p.staff.rp.per.per_lname}, {p.staff.rp.per.per_fname}",
                'position': p.staff.pos.pos_title
            } for p in queryset]
        else:
            data = [{
                'wstp_id': p.wstp_id,
                'staff': {
                    'staff_id': p.staff.staff_id,
                    'assign_date': p.staff.staff_assign_date.isoformat(),
                    'position': {
                        'pos_id': p.staff.pos.pos_id,
                        'title': p.staff.pos.pos_title,
                        'max': p.staff.pos.pos_max
                    },
                    'profile': {
                        'rp_id': p.staff.rp.rp_id,
                        'personal': {
                            'per_id': p.staff.rp.per.per_id,
                            'lname': p.staff.rp.per.per_lname,
                            'fname': p.staff.rp.per.per_fname,
                            'mname': p.staff.rp.per.per_mname,
                            'suffix': p.staff.rp.per.per_suffix,
                            'dob': p.staff.rp.per.per_dob.isoformat(),
                            'sex': p.staff.rp.per.per_sex,
                            'status': p.staff.rp.per.per_status,
                            'education': p.staff.rp.per.per_edAttainment,
                            'religion': p.staff.rp.per.per_religion,
                            'contact': p.staff.rp.per.per_contact
                        }
                    },
                    'manager': {
                        'staff_id': p.staff.manager.staff_id,
                        'name': f"{p.staff.manager.rp.per.per_lname}, {p.staff.manager.rp.per.per_fname}"
                    } if p.staff.manager else None
                }
            } for p in queryset]
        return Response(data)


class WasteTruckView(APIView):
    serializer_class = WasteTruckSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        is_archive = request.query_params.get('is_archive', None)
        if is_archive is not None:
            is_archive = is_archive.lower() == 'true'
            trucks = WasteTruck.objects.filter(truck_is_archive=is_archive)
        else:
            trucks = WasteTruck.objects.all()  # Fetch all trucks
        serializer = WasteTruckSerializer(trucks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WasteTruckSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WasteTruckDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WasteTruckSerializer
    queryset = WasteTruck.objects.all()
    lookup_field = 'truck_id'
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return WasteTruck.objects.get(pk=pk)
        except WasteTruck.DoesNotExist:
            return None
    
    def get(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck)
        return Response(serializer.data)
    
    def put(self, request, pk):
        truck = self.get_object(pk)
        if not truck:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = WasteTruckSerializer(truck, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # def delete(self, request, pk):
    #     truck = self.get_object(pk)
    #     if not truck:
    #         return Response(status=status.HTTP_404_NOT_FOUND)
    #     truck.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, pk):
        instance = self.get_object(pk)
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # Permanent delete
            instance.delete()
        else:
            # Soft delete (archive)
            instance.truck_is_archive = True
            instance.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class WasteTruckRestoreView(generics.UpdateAPIView):
    queryset = WasteTruck.objects.filter(truck_is_archive=True)
    serializer_class = WasteTruckSerializer
    lookup_field = 'truck_id'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.truck_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

# get Driver for garbage Collection Form
class DriverPersonnelAPIView(APIView):
    def get(self, request, *args, **kwargs): 
        allowed_positions = ["WASTE DRIVER", "TRUCK DRIVER", "DRIVER", "DRIVER LOADER"]  
        
        drivers = WastePersonnel.objects.filter(
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff__pos',
            'staff__rp__per'
        )
        
        data = [driver.to_dict() for driver in drivers]
        return Response(data)
     
#get Collectors for garbage collection Form
class CollectorPersonnelAPIView(APIView):
    def get(self, request, *args, **kwargs): 
        allowed_positions = ["WASTE COLLECTOR", "COLLECTOR","LOADER"]  
        
        collectors = WastePersonnel.objects.filter( 
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff__pos',
            'staff__rp__per'
        )
        
        data = [collector.to_dict() for collector in collectors]
        return Response(data)
    
#get Sitio 
class SitioListView(generics.ListCreateAPIView):
    # permission_classes = [AllowAny]
    queryset = Sitio.objects.all()
    serializer_class = SitioSerializer

class WasteCollectorView(generics.ListCreateAPIView):
    serializer_class = WasteCollectorSerializer
    queryset = WasteCollector.objects.all()


class WatchmanView(generics.GenericAPIView): 
    def get(self, request, *args, **kwargs):
        watchmen = WastePersonnel.objects.filter(
            staff_id__pos__pos_title="WATCHMAN"  
        ).select_related(
            'staff__pos',
            'staff__rp__per'
        )

        data = [watchman.to_dict() for watchman in watchmen]
        return Response(data)
    
# ============== GARBAGE PICKUP ================

class GarbagePickupRequestAnalyticsView(APIView):
    def get(self, request, format=None):
        counts = {
            'pending': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='pending').count(),
            'accepted': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='accepted').count(),
            'rejected': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='rejected').count(),
            'completed': Garbage_Pickup_Request.objects.filter(garb_req_status__iexact='completed').count(),
            'total': Garbage_Pickup_Request.objects.count()
        }
        
        return Response(counts, status=status.HTTP_200_OK)
    

class GarbagePickupFileView(generics.ListCreateAPIView):
    serializer_class = GarbagePickupFileSerializer
    queryset = GarbagePickupRequestFile.objects.all()
     
class GarbagePickupRequestPendingView(generics.ListCreateAPIView):
    serializer_class = GarbagePickupRequestPendingSerializer
    def get_queryset(self):
        queryset = Garbage_Pickup_Request.objects.all()
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset
    
class GarbagePickupRequestRejectedView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestRejectedSerializer
    def get_queryset(self):
        queryset = Garbage_Pickup_Request.objects.all()
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset
    
class GarbagePickupRequestAcceptedView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestAcceptedSerializer
    
    def get_queryset(self):
        queryset = Garbage_Pickup_Request.objects.select_related(
            'rp', 'rp__per', 'gprf', 'sitio_id'
        ).prefetch_related(
            'pickup_request_decision_set',
            'pickup_request_decision_set__staff_id',
            'pickup_request_decision_set__staff_id__rp',
            'pickup_request_decision_set__staff_id__rp__per',
            'pickup_assignment_set',
            'pickup_assignment_set__truck_id',
            'pickup_assignment_set__wstp_id',
            'pickup_assignment_set__assignment_collector_set',
            'pickup_assignment_set__assignment_collector_set__wstp_id',
        )
        
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset
    
class GarbagePickupAcceptedRequestDetailView(generics.RetrieveAPIView):
    serializer_class = GarbagePickupRequestAcceptedSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'  # or 'id' depending on your model

    def get_object(self):
        obj = super().get_object()
        return obj


class GarbagePickupRequestsByDriverView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestAcceptedSerializer

    def get_queryset(self):
        driver_id = self.request.query_params.get('wstp_id')

        if not driver_id:
            return Garbage_Pickup_Request.objects.none()

        assigned_garb_ids = Pickup_Assignment.objects.filter(
            wstp_id=driver_id
        ).values_list('garb_id', flat=True)

        return Garbage_Pickup_Request.objects.filter(
            garb_id__in=assigned_garb_ids,
            garb_req_status__iexact='accepted'  # Filter only accepted requests
        )

    
class GarbagePickupRequestCompletedView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestCompletedSerializer
    def get_queryset(self):
        queryset = Garbage_Pickup_Request.objects.all()
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset 
    
class GarbagePickupCompletedRequestDetailView(generics.RetrieveAPIView):
    serializer_class = GarbagePickupRequestCompletedSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'  # or 'id' depending on your model

    def get_object(self):
        obj = super().get_object()
        return obj
    
class GarbagePickupCompletedByDriverView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestCompletedSerializer

    def get_queryset(self):
        driver_id = self.request.query_params.get('wstp_id')

        if not driver_id:
            return Garbage_Pickup_Request.objects.none()

        return Garbage_Pickup_Request.objects.filter(
            pickup_assignment__wstp_id=driver_id,
            pickup_confirmation__conf_staff_conf=True
        ).prefetch_related(
            'pickup_request_decision_set' 
        ).distinct()

class UpdateGarbagePickupRequestStatusView(generics.UpdateAPIView):
    serializer_class = GarbagePickupRequestPendingSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdatePickupAssignmentView(generics.UpdateAPIView):
    serializer_class = PickupAssignmentSerializer
    queryset = Pickup_Assignment.objects.all()
    lookup_field = 'pick_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PickupRequestDecisionView(generics.ListCreateAPIView):
    serializer_class = PickupRequestDecisionSerializer
    queryset = Pickup_Request_Decision.objects.all()

class PickupAssignmentView(generics.ListCreateAPIView):
    serializer_class = PickupAssignmentSerializer
    queryset = Pickup_Assignment.objects.all()

class AssignmentCollectorView(generics.ListCreateAPIView):
    serializer_class = AssignmentCollectorSerializer
    queryset = Assignment_Collector.objects.all()

class PickupConfirmationView(generics.ListCreateAPIView):
    serializer_class = PickupConfirmationSerializer
    queryset = Pickup_Confirmation.objects.all()

    
class UpdatePickupConfirmationView(generics.RetrieveUpdateAPIView):
    serializer_class = PickupConfirmationSerializer
    queryset = Pickup_Confirmation.objects.all()
    lookup_field = 'garb_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssignmentCollectorDeleteView(generics.DestroyAPIView):
    serializer_class = AssignmentCollectorSerializer
    queryset = Assignment_Collector.objects.all()
    lookup_field = 'acl_id'  # Or the primary key field name for Assignment_Collector

    def get_object(self):
        acl_id = self.kwargs.get('acl_id')
        return get_object_or_404(Assignment_Collector, acl_id=acl_id)
    
class GarbagePickupRequestPendingByRPView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestPendingSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        print(f"Filtering for rp_id: {rp_id}")  
        queryset = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='pending'  
        ).order_by('-garb_created_at')  # Most recent first
        print(f"Found {queryset.count()} records") 
        return queryset


class GarbagePickupRequestRejectedByRPView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestRejectedSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')

        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date')

        return (
            Garbage_Pickup_Request.objects
            .filter(rp_id=rp_id, garb_req_status='rejected')
            .annotate(latest_dec_date=Subquery(latest_decision.values('dec_date')[:1]))
            .order_by('-latest_dec_date')  # newest on top
        )
    
class GarbagePickupRequestAcceptedByRPView(generics.ListAPIView):
    serializer_class = ResidentAcceptedPickupRequestsSerializer
        
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date').values('dec_date')[:1]
        
        accepted_requests = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='accepted'
        ).annotate(
            latest_dec_date=Subquery(latest_decision)
        )
        
        completed_requests = Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id,
            garb_req_status='completed'
        ).filter(
            pickup_confirmation__conf_resident_conf=False
        ).annotate(
            latest_dec_date=Subquery(latest_decision)
        )
        
        queryset = (accepted_requests | completed_requests).order_by(
            '-latest_dec_date',  
            '-garb_created_at'   
        )
        
        return queryset
    

class GarbagePickupRequestAcceptedDetailView(generics.RetrieveAPIView):
    serializer_class = ResidentAcceptedPickupRequestsSerializer
    queryset = Garbage_Pickup_Request.objects.all()
    lookup_field = 'garb_id'

    def get_object(self):
        garb_id = self.kwargs.get('garb_id')
        return generics.get_object_or_404(self.get_queryset(), garb_id=garb_id)
    

class GarbagePickupRequestCompletedByRPView(generics.ListAPIView):
    serializer_class = ResidentCompletedPickupRequestSerializer
    
    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')
        
        resident_conf_date = Pickup_Confirmation.objects.filter(
            garb_id=OuterRef('pk'),
            conf_resident_conf=True
        ).values('conf_resident_conf_date')[:1]
        
        return Garbage_Pickup_Request.objects.filter(
            rp_id=rp_id, 
            garb_req_status='completed'
        ).filter(
            Q(pickup_confirmation__conf_resident_conf=True) &
            Q(pickup_confirmation__conf_staff_conf=True)
        ).annotate(
            resident_confirmation_date=Subquery(resident_conf_date)
        ).order_by(
            '-resident_confirmation_date' 
        ).distinct()

class GarbagePickupRequestCancelledByRPView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestRejectedSerializer

    def get_queryset(self):
        rp_id = self.kwargs.get('rp_id')

        latest_decision = Pickup_Request_Decision.objects.filter(
            garb_id=OuterRef('pk')
        ).order_by('-dec_date')

        return (
            Garbage_Pickup_Request.objects
            .filter(rp_id=rp_id, garb_req_status='cancelled')
            .annotate(latest_dec_date=Subquery(latest_decision.values('dec_date')[:1]))
            .order_by('-latest_dec_date')  # newest on top
        )

