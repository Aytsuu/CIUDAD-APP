from rest_framework import generics
from .models import ServiceChargeRequest
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Prefetch
from rest_framework.views import APIView


class ServiceChargeRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestSerializer

    def get_queryset(self):
        queryset = ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid", 
            sr_type="Summon"
        ).select_related(
            'comp'
        )
        
        # Only apply prefetch_related if there are records with complaints
        if queryset.filter(comp__isnull=False).exists():
            queryset = queryset.prefetch_related(
                Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
                Prefetch('comp__complaintaccused_set', queryset=ComplaintAccused.objects.select_related('acsd')),
                'file_action_file'
            )
        
        return queryset.order_by('-sr_req_date')

# class FileActionrequestView(generics.ListCreateAPIView):
#     serializer_class = FileActionRequestSerializer
#     queryset = ServiceChargeRequest.objects.all()

class FileActionrequestView(generics.ListCreateAPIView):
    serializer_class = FileActionRequestSerializer
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.select_related(
            'comp',
            'file_action_file'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add'))
        ).order_by('-sr_req_date')

class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceChargeRequestDetailSerializer
    lookup_field = 'sr_id'
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid",
            sr_type="Summon"
        ).select_related(
            'comp',
            'file_action_file',
            'parent_summon'
        ).prefetch_related(
            Prefetch('comp__complainant', queryset=Complainant.objects.select_related('add')),
            Prefetch('comp__complaintaccused_set__acsd', queryset=Accused.objects.select_related('add')),
            Prefetch('case', queryset=CaseActivity.objects.prefetch_related(
                'supporting_docs',
                'srf'
            ))
        )
            
# class CaseActivityView(generics.ListCreateAPIView):
#     serializer_class = CaseActivitySerializer
#     queryset = CaseActivity.objects.all()

class CaseActivityView(generics.ListCreateAPIView):
    serializer_class = CaseActivitySerializer
    
    def get_queryset(self):
        return CaseActivity.objects.select_related(
            'sr',
            'srf'
        ).prefetch_related(
            'supporting_docs'
        ).order_by('-ca_date_of_issuance')

class CaseSuppDocView(generics.ListCreateAPIView):
    serializer_class = CaseSuppDocSerializer
    
    def get_queryset(self):
        queryset = CaseSuppDoc.objects.all()
        ca_id = self.kwargs.get('ca_id')
        if ca_id is not None:
            queryset = queryset.filter(ca_id=ca_id)
        return queryset
    
class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
    queryset = CaseSuppDoc.objects.all()
    serializer_class = CaseSuppDocSerializer
    lookup_field = 'csd_id'

class UpdateCaseSuppDocView(generics.UpdateAPIView):
    serializer_class = CaseSuppDocSerializer
    queryset = CaseSuppDoc.objects.all()
    lookup_field = 'csd_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CaseSuppDocView(generics.ListCreateAPIView):
    serializer_class = CaseSuppDocSerializer
    
    def get_queryset(self):
        queryset = CaseSuppDoc.objects.all()
        ca_id = self.kwargs.get('ca_id')
        if ca_id is not None:
            queryset = queryset.filter(ca_id=ca_id)
        return queryset
    
class DeleteCaseSuppDocView(generics.RetrieveDestroyAPIView):
    queryset = CaseSuppDoc.objects.all()
    serializer_class = CaseSuppDocSerializer
    lookup_field = 'csd_id'

class UpdateCaseSuppDocView(generics.UpdateAPIView):
    serializer_class = CaseSuppDocSerializer
    queryset = CaseSuppDoc.objects.all()
    lookup_field = 'csd_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateServiceChargeRequestView(generics.UpdateAPIView):
    serializer_class = ServiceChargeRequestSerializer
    queryset = ServiceChargeRequest.objects.all()
    lookup_field = 'sr_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ServiceChargeRequestFileView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestFileSerializer
    queryset = ServiceChargeRequestFile.objects.all()

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
