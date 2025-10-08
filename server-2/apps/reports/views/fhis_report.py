from django.db.models import Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class FHISMonthlyView(APIView):
    """
    Simple monthly view - just set your_model and optionally date_field
    """
    your_model = None  # Set this to your actual model
    date_field = 'created_at'  # Change if your date field has different name
    
    def get(self, request):
        try:
            # Get year filter if provided
            year = request.GET.get('year', '').strip()
            
            # Query to get monthly counts
            queryset = self.your_model.objects.all()
            
            if year:
                queryset = queryset.filter(**{f"{self.date_field}__year": year})
            
            monthly_counts = (
                queryset
                .annotate(month=TruncMonth(self.date_field))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('-month')
            )
            
            # Format the response
            formatted_data = []
            for item in monthly_counts:
                formatted_data.append({
                    'year': item['month'].year,
                    'month': item['month'].month,
                    'month_name': item['month'].strftime('%B'),
                    'year_month': item['month'].strftime('%Y-%m'),
                    'count': item['count']
                })
            
            return Response({
                'success': True,
                'data': formatted_data,
                'total_months': len(formatted_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
