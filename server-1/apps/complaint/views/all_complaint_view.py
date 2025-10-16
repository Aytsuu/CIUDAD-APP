from rest_framework import generics, status
from ..models import Complaint
from ..serializers import ComplaintSerializer
from django.db.models import Prefetch
import logging

logger = logging.getLogger(__name__)


class ComplaintListView(generics.ListAPIView):
    serializer_class = ComplaintSerializer

    def get_queryset(self):
        try:
            queryset = Complaint.objects.prefetch_related(
                'complaintcomplainant_set__cpnt__rp_id',
                # 'complaintaccused_set__acsd__rp_id',
                'files',
                'staff'
            ).filter(comp_is_archive=False).order_by('-comp_created_at')
            
            # we filter by comp_status
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(comp_status=status)
                
            return queryset
        
        except Exception as e:
            logger.error(f"Error in ComplaintListView queryset: {str(e)}")
            return Complaint.objects.none()