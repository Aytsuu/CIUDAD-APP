from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Complaint
from ..serializers import ComplaintSerializer

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
