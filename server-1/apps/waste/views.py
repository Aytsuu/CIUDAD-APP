from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, filters
from .models import WasteTruck
from apps.profiling.models import Sitio

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

# WASTE COLLECTION UPDATE
class WasteCollectionSchedUpdateView(generics.RetrieveUpdateAPIView):
    queryset = WasteCollectionSched.objects.all()
    serializer_class = WasteCollectionSchedSerializer
    lookup_field = 'wc_num'

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


class WasteHotspotView(generics.ListCreateAPIView):
    serializer_class = WasteHotspotSerializer
    queryset = WasteHotspot.objects.all()

class WasteReportFileView(generics.ListCreateAPIView):
    serializer_class = WasteReportFileSerializer
    queryset = WasteReport_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        rep_num = self.request.query_params.get('rep_num')
        if rep_num:
            queryset = queryset.filter(rep_num=rep_num)
        return queryset

class WasteReportView(generics.ListCreateAPIView):
    serializer_class = WasteReportSerializer
    queryset = WasteReport.objects.all()

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


class WastePersonnelView(generics.ListAPIView):  # ONLY GET method allowed
    serializer_class = WastePersonnelSerializer
    queryset = WastePersonnel.objects.all()
    filter_backends = [filters.SearchFilter]  
    filterset_fields = {
        'staff_id__pos__pos_title': ['exact', 'icontains'],  
        'staff_id__rp__per__per_lname': ['icontains'],  
        'staff_id__rp__per__per_fname': ['icontains'],  
    }
    search_fields = [
        'staff_id__rp__per__per_lname',
        'staff_id__rp__per__per_fname',
        'staff_id__pos__pos_title',
    ]
    
    def get_queryset(self):
        print("get_queryset called")
        queryset = super().get_queryset()
        queryset = queryset.select_related(
            'staff_id__pos',
            'staff_id__rp__per',
            'staff_id__manager__rp__per'
        )
        position = self.request.query_params.get('staff_id__pos__pos_title')
        if position:
            print("Filtering by position:", position)
            queryset = queryset.filter(staff_id__pos__pos_title=position)
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        minimal = request.query_params.get('minimal', '').lower() == 'true'
        if minimal:
            data = [{
                'wstp_id': p.wstp_id,
                'staff_id': p.staff_id.staff_id,
                'name': f"{p.staff_id.rp.per.per_lname}, {p.staff_id.rp.per.per_fname}",
                'position': p.staff_id.pos.pos_title
            } for p in queryset]
        else:
            data = [{
                'wstp_id': p.wstp_id,
                'staff': {
                    'staff_id': p.staff_id.staff_id,
                    'assign_date': p.staff_id.staff_assign_date.isoformat(),
                    'position': {
                        'pos_id': p.staff_id.pos.pos_id,
                        'title': p.staff_id.pos.pos_title,
                        'max': p.staff_id.pos.pos_max
                    },
                    'profile': {
                        'rp_id': p.staff_id.rp.rp_id,
                        'personal': {
                            'per_id': p.staff_id.rp.per.per_id,
                            'lname': p.staff_id.rp.per.per_lname,
                            'fname': p.staff_id.rp.per.per_fname,
                            'mname': p.staff_id.rp.per.per_mname,
                            'suffix': p.staff_id.rp.per.per_suffix,
                            'dob': p.staff_id.rp.per.per_dob.isoformat(),
                            'sex': p.staff_id.rp.per.per_sex,
                            'status': p.staff_id.rp.per.per_status,
                            'education': p.staff_id.rp.per.per_edAttainment,
                            'religion': p.staff_id.rp.per.per_religion,
                            'contact': p.staff_id.rp.per.per_contact
                        }
                    },
                    'manager': {
                        'staff_id': p.staff_id.manager.staff_id,
                        'name': f"{p.staff_id.manager.rp.per.per_lname}, {p.staff_id.manager.rp.per.per_fname}"
                    } if p.staff_id.manager else None
                }
            } for p in queryset]
        return Response(data)

class WasteTruckView(APIView):
    serializer_class = WasteTruckSerializer

    # def get(self, request):
    #     trucks = WasteTruck.objects.all()
    #     serializer = WasteTruckSerializer(trucks, many=True)
    #     return Response(serializer.data)

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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.truck_is_archive = False
        instance.save()
        return Response(status=status.HTTP_200_OK)

# get Driver for garbage Collection Form
class DriverPersonnelAPIView(APIView):
    def get(self, request, *args, **kwargs): 
        allowed_positions = ["Waste Driver", "Truck Driver", "Driver"]  
        
        drivers = WastePersonnel.objects.filter(
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff_id__pos',
            'staff_id__rp__per'
        )
        
        data = [driver.to_dict() for driver in drivers]
        return Response(data)
     
#get Collectors for garbage collection Form
class CollectorPersonnelAPIView(APIView):
    def get(self, request, *args, **kwargs): 
        allowed_positions = ["Waste Collector", "Collector"]  
        
        collectors = WastePersonnel.objects.filter( 
            staff_id__pos__pos_title__in=allowed_positions
        ).select_related(  # Optimize query
            'staff_id__pos',
            'staff_id__rp__per'
        )
        
        data = [collector.to_dict() for collector in collectors]
        return Response(data)
    
#get Sitio 
class SitioListView(generics.ListCreateAPIView):
    queryset = Sitio.objects.all()
    serializer_class = SitioSerializer
     
class GarbagePickupRequestPendingView(generics.ListAPIView):
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
        queryset = Garbage_Pickup_Request.objects.all()
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset
    
class GarbagePickupRequestCompletedView(generics.ListAPIView):
    serializer_class = GarbagePickupRequestCompletedSerializer
    def get_queryset(self):
        queryset = Garbage_Pickup_Request.objects.all()
        status = self.request.query_params.get('status', None)
        
        if status:
            queryset = queryset.filter(garb_req_status__iexact=status.lower())
        
        return queryset 


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

class AssignmentCollectorDeleteView(generics.DestroyAPIView):
    serializer_class = AssignmentCollectorSerializer
    queryset = Assignment_Collector.objects.all()
    lookup_field = 'acl_id'  # Or the primary key field name for Assignment_Collector

    def get_object(self):
        acl_id = self.kwargs.get('acl_id')
        return get_object_or_404(Assignment_Collector, acl_id=acl_id)