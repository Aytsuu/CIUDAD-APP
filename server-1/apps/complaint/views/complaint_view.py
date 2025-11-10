from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Complaint
from ..serializers import ComplaintSerializer
import logging

logger = logging.getLogger(__name__)

class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        queryset = Complaint.objects.prefetch_related(
            'complaintcomplainant_set__cpnt',
            'complaintaccused_set__acsd',
            'files',
            'staff'
        ).order_by('-comp_created_at')

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(comp_status=status)
        return queryset

        
class ResidentsComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        try:
            user = self.request.user
            
            # Get the user's resident profile
            if not hasattr(user, 'rp') or user.rp is None:
                logger.warning(f"User {user.acc_id} has no resident profile")
                return Complaint.objects.none()
            
            rp_id = user.rp.rp_id
            if not rp_id:
                return Complaint.objects.none()
            
            queryset = Complaint.objects.prefetch_related(
                'complaintcomplainant_set__cpnt__rp_id',
                # 'complaintaccused_set__acsd__rp_id',
                'files',
                'staff'
            ).filter(
                complaintcomplainant__cpnt__rp_id__rp_id=rp_id
            ).order_by('-comp_created_at')
            
            # we filter by comp_status
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(comp_status=status)
                
            return queryset
        
        except Exception as e:
            logger.error(f"Error in ResidentsComplaintListView queryset: {str(e)}")
            return Complaint.objects.none()

class ComplaintDetailView(APIView):
    def get(self, request, *args, **kwargs):
        comp_id = request.query_params.get('comp_id')
        
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
    
    def post(self, request, *args, **kwargs):
        comp_id = request.data.get('comp_id')

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
        return Response(serializer.data)
