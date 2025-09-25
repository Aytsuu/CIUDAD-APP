from apps.patientrecords.models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.childhealthservices.models import ChildHealthrecord
from django.db.models import F
from apps.healthProfiling.models import FamilyComposition
from rest_framework import status
from ..serializers.family_serializer import ChildrenInfoSerializer



class MyChildrenSimpleAPIView(APIView):
    """
    API endpoint returning children info in frontend-compatible format
    URL: /api/my-children-formatted/<str:pat_id>/
    """
    
    def get(self, request, pat_id):
        try:
            # Verify the pat_id belongs to a parent
            parent_fc = FamilyComposition.objects.filter(
                rp__patients__pat_id=pat_id,
                fc_role__in=['MOTHER', 'FATHER']
            ).select_related('fam').first()
            
            if not parent_fc:
                return Response({
                    'success': False,
                    'error': 'User is not a mother or father',
                    'pat_id': pat_id
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get children's health records
            children_records = ChildHealthrecord.objects.filter(
                patrec__pat_id__rp_id__family_compositions__fam=parent_fc.fam
            ).exclude(  # Exclude the parent's own records
                patrec__pat_id__pat_id=pat_id
            ).select_related(
                'patrec__pat_id__rp_id__per',
                'patrec__pat_id__rp_id'
            ).prefetch_related(
                'patrec__pat_id__rp_id__per__personal_addresses__add',
            ).distinct()
            
            # Serialize the data
            serializer = ChildrenInfoSerializer(
                children_records, 
                many=True,
                context={'parent_pat_id': pat_id}  # Pass parent pat_id to serializer
            )
            
            return Response({
                'success': True,
                'parent_pat_id': pat_id,
                'parent_role': parent_fc.fc_role,
                'parent_name': f"{parent_fc.rp.per.per_fname} {parent_fc.rp.per.per_lname}",
                'family_id': parent_fc.fam.fam_id,
                'children': serializer.data,
                'children_count': len(serializer.data)
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'pat_id': pat_id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)