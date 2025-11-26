# Standard library imports
from collections import defaultdict
from datetime import datetime, timedelta
import logging

# Django imports
from django.db.models import (
   OuterRef, Subquery, Q, Prefetch, Count, Subquery
)
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# DRF imports
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

# Local app imports
from ..models import *
from ..serializers import *
from ..utils import *
from apps.patientrecords.models import *
from apps.healthProfiling.models import *
from pagination import *
from apps.inventory.models import * 
from apps.medicalConsultation.utils import apply_patient_type_filter






class ChildHealthPendingFollowUpView(APIView):
    """
    Retrieve pending follow-up visits for a specific child health record (chrec_id)
    using ChildHealthNotesBaseSerializer
    """
    def get(self, request, chrec_id):
        try:
            # Get the child health record
            child_health_record = get_object_or_404(ChildHealthrecord, chrec_id=chrec_id)
            
            # Get ChildHealthNotes for this record that have PENDING follow-up visits
            child_health_notes = ChildHealthNotes.objects.filter(
                chhist__chrec=child_health_record,  # Link through chhist->chrec
                # Only notes with follow-up visits
                followv__followv_status__in=['pending', 'missed']  # Only pending or missed status
            ).select_related('followv', 'staff', 'chhist', 'chhist__chrec')
            
            # Group notes by their follow-up visit
            followups_dict = {}
            
            for note in child_health_notes:
                if note.followv:  # Ensure followv exists
                    followv_id = note.followv.followv_id
                    
                    if followv_id not in followups_dict:
                        # Create follow-up visit entry
                        followup_data = FollowUpVisitSerializerBase(note.followv).data
                        followup_data['child_health_notes'] = []
                        followups_dict[followv_id] = followup_data
                    
                    # Add the note to the follow-up visit using ChildHealthNotesBaseSerializer
                    note_data = ChildHealthNotesBaseSerializer(note).data
                    followups_dict[followv_id]['child_health_notes'].append(note_data)
            
            # Convert dictionary to list
            followups_data = list(followups_dict.values())
            
            # Add notes count to each follow-up
            for followup in followups_data:
                followup['notes_count'] = len(followup['child_health_notes'])
            
            return Response({
                'success': True,
                'chrec_id': chrec_id,
                'pending_followups': followups_data,
                'count': len(followups_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class FollowUpVisitUpdateView(APIView):
    """
    Update a specific follow-up visit status
    """
    def patch(self, request, followv_id):
        try:
            # Get the follow-up visit instance
            followup_visit = get_object_or_404(FollowUpVisit, followv_id=followv_id)
            
            # Get the new status from request data
            new_status = request.data.get('followv_status')
            
            # Validate the status
            valid_statuses = ['pending', 'completed','missed']
            if new_status and new_status not in valid_statuses:
                return Response({
                    'success': False,
                    'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update the follow-up visit
            if new_status:
                followup_visit.followv_status = new_status
                
                # Set completed_at if status is changed to 'completed'
                if new_status == 'completed' and not followup_visit.completed_at:
                    followup_visit.completed_at = timezone.now().date()
                
                # Clear completed_at if status is changed from 'completed' to something else
                if new_status != 'completed' and followup_visit.followv_status == 'completed':
                    followup_visit.completed_at = None
            
            # You can also allow updating other fields if needed
            if 'followv_description' in request.data:
                followup_visit.followv_description = request.data.get('followv_description')
            
            if 'followv_date' in request.data:
                followup_visit.followv_date = request.data.get('followv_date')
            
            # Save the changes
            followup_visit.save()
            
            # Return the updated data
            return Response({
                'success': True,
                'message': 'Follow-up visit updated successfully',
                'data': {
                    'followv_id': followup_visit.followv_id,
                    'followv_status': followup_visit.followv_status,
                    'followv_date': followup_visit.followv_date,
                    'followv_description': followup_visit.followv_description,
                    'completed_at': followup_visit.completed_at,
                    'created_at': followup_visit.created_at
                }
            }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)       
            