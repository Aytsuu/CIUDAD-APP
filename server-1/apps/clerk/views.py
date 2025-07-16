from rest_framework import generics
from rest_framework.exceptions import NotFound
from .models import ServiceChargeRequest
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Prefetch

class ServiceChargeRequestView(generics.ListCreateAPIView):
    serializer_class = ServiceChargeRequestSerializer

    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(sr_payment_status="Paid", sr_type = "Summon").select_related(
            'comp__cpnt'  
        ).prefetch_related(
            'comp__complaintaccused_set__acsd'  
        )

class FileActionrequestView(generics.ListCreateAPIView):
    serializer_class = FileActionRequestSerializer
    queryset = ServiceChargeRequest.objects.all()

# class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
#     serializer_class = ServiceChargeRequestDetailSerializer
#     lookup_field = 'sr_id'
    
#     def get_queryset(self):
#         return ServiceChargeRequest.objects.filter(
#             sr_payment_status="Paid",
#             sr_type="Summon"
#         ).select_related(
#             'comp__cpnt'
#         ).prefetch_related(
#             'comp__complaintaccused_set__acsd',
#             Prefetch('case', queryset=CaseActivity.objects.prefetch_related('supporting_docs'))
#         )

class ServiceChargeRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceChargeRequestDetailSerializer
    lookup_field = 'sr_id'
    
    def get_queryset(self):
        return ServiceChargeRequest.objects.filter(
            sr_payment_status="Paid",
            sr_type="Summon"
        ).select_related(
            'comp__cpnt__add',  # Include complainant's address
            'comp'  # Include complaint
        ).prefetch_related(
            'comp__complaintaccused_set__acsd__add',  # Include accused's address
            Prefetch('case', queryset=CaseActivity.objects.prefetch_related('supporting_docs'))
        )
        
class CaseActivityView(generics.ListCreateAPIView):
    serializer_class = CaseActivitySerializer
    queryset = CaseActivity.objects.all()

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
    


