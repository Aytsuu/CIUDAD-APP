# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone
from pagination import StandardResultsPagination


class FHISMonthlyView(APIView):
    pagination_class = StandardResultsPagination
    
    def generate_monthly_data(self, start_year=2020, start_month=1):
        """Generate monthly data from start date to current month"""
        months = []
        current_date = timezone.now()
        current_year = current_date.year
        current_month = current_date.month
        
        year = start_year
        month = start_month
        
        while year < current_year or (year == current_year and month <= current_month):
            # Create date object for the month
            date_obj = datetime(year, month, 1)
            
            # Generate data with full month name including year
            months.append({
                'year': year,
                'month': month,
                'month_name': date_obj.strftime('%B %Y'),  # Full month name with year
                'year_month': date_obj.strftime('%Y-%m'),
            })
            
            # Move to next month
            month += 1
            if month > 12:
                month = 1
                year += 1
        
        # Return newest first
        return sorted(months, key=lambda x: (x['year'], x['month']), reverse=True)
    
    def get(self, request):
        try:
            # Get parameters
            search_query = request.GET.get('search', '').strip()
            year_param = request.GET.get('year', 'all')
            
            # Get current month info
            current_date = timezone.now()
            current_month_year = current_date.strftime('%Y-%m')
            current_month_name = current_date.strftime('%B %Y')
            
            # Generate all monthly data (from 2020 to current month)
            all_months = self.generate_monthly_data(2020, 1)
            
            # Apply filters
            filtered_data = all_months
            
            # Year filter
            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        # Specific month-year (e.g., 2024-09)
                        year, month = map(int, year_param.split('-'))
                        filtered_data = [m for m in filtered_data if m['year'] == year and m['month'] == month]
                    else:
                        # Specific year only (e.g., 2024)
                        year = int(year_param)
                        filtered_data = [m for m in filtered_data if m['year'] == year]
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid year format. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Search filter
            if search_query:
                filtered_data = [
                    m for m in filtered_data 
                    if search_query.lower() in m['month_name'].lower() 
                    or search_query in m['year_month']
                ]
            
            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(filtered_data, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(filtered_data),
                    'current_month': current_month_year,
                    'current_month_name': current_month_name
                })

            return Response({
                'success': True,
                'data': filtered_data,
                'total_months': len(filtered_data),
                'current_month': current_month_year,
                'current_month_name': current_month_name
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)