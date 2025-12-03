from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from apps.complaint.models import Complaint
from apps.complaint.serializers import ComplaintCardAnalyticsSerializer
from django.utils import timezone
from datetime import timedelta

class ComplaintCardAnalyticsView(APIView):
    
    def get(self, request):
        try:
            # Count complaints by status
            counts = Complaint.objects.aggregate(
                pending=Count('comp_id', filter=Q(comp_status='Pending')),
                accepted=Count('comp_id', filter=Q(comp_status='Accepted')),
                rejected=Count('comp_id', filter=Q(comp_status='Rejected')),
                cancelled=Count('comp_id', filter=Q(comp_status='Cancelled')),
                raised=Count('comp_id', filter=Q(comp_status='Raised')),
            )
            
            # Ensure we never return None values
            safe_counts = {
                'pending': counts.get('pending', 0) or 0,
                'accepted': counts.get('accepted', 0) or 0,
                'rejected': counts.get('rejected', 0) or 0,
                'cancelled': counts.get('cancelled', 0) or 0,
                'raised': counts.get('raised', 0) or 0,
            }
            
            serializer = ComplaintCardAnalyticsSerializer(safe_counts)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            safe_counts = {
                'pending': 0,
                'accepted': 0,
                'rejected': 0,
                'cancelled': 0,
                'raised': 0,
            }
            serializer = ComplaintCardAnalyticsSerializer(safe_counts)
            return Response(serializer.data, status=status.HTTP_200_OK)
        

class ComplaintChartAnalyticsView(APIView):
    
    def get(self, request):
        try:
            period = request.GET.get('period', 'daily')  # daily, weekly, monthly
            
            end_date = timezone.now()
            start_date = end_date - timedelta(days=90)

            
            if period == 'weekly':
                # Group by week
                complaints = Complaint.objects.filter(
                    comp_created_at__gte=start_date,
                    comp_created_at__lte=end_date
                ).annotate(
                    week=TruncWeek('comp_created_at')
                ).values('week').annotate(
                    complaint=Count('comp_id')
                ).order_by('week')
                
                complaint_data = [{
                    'date': item['week'].isoformat(),
                    'complaint': item['complaint']
                } for item in complaints]
                
            elif period == 'monthly':
                # Group by month
                complaints = Complaint.objects.filter(
                    comp_created_at__gte=start_date,
                    comp_created_at__lte=end_date
                ).annotate(
                    month=TruncMonth('comp_created_at')
                ).values('month').annotate(
                    complaint=Count('comp_id')
                ).order_by('month')
                
                complaint_data = [{
                    'date': item['month'].isoformat(),
                    'complaint': item['complaint']
                } for item in complaints]
                
            else:
                # Default: daily grouping
                complaints = Complaint.objects.filter(
                    comp_created_at__gte=start_date,
                    comp_created_at__lte=end_date
                ).annotate(
                    date=TruncDate('comp_created_at')
                ).values('date').annotate(
                    complaint=Count('comp_id')
                ).order_by('date')
                
                complaint_data = [{
                    'date': item['date'].isoformat(),
                    'complaint': item['complaint']
                } for item in complaints]
            
            return Response(complaint_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response([], status=status.HTTP_200_OK)