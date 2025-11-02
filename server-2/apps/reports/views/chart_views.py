# from apps.childhealthservices.serializers import NutritionalStatusSerializerBase
# from apps.childhealthservices.models import NutritionalStatus
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# class NutritionalStatusMonthlyChart(APIView):
#     def get(self, request, month):
#         """
#         Get detailed nutritional status records for a specific month (format: YYYY-MM)
#         """
#         try:
#             year, month_num = map(int, month.split('-'))
            
#             queryset = NutritionalStatus.objects.filter(
#                 created_at__year=year,
#                 created_at__month=month_num
#             ).select_related(
#                 'bm', 'bm__patrec', 'bm__patrec__pat_id',
#             ).order_by('-created_at')

#             serializer = NutritionalStatusSerializerBase(queryset, many=True)
            
#             return Response({
#                 'success': True,
#                 'month': month,
#                 'month_name': f"{month_num:02d}/{year}",
#                 'record_count': queryset.count(),
#                 'records': serializer.data
#             }, status=status.HTTP_200_OK)

#         except ValueError:
#             return Response({
#                 'success': False,
#                 'error': 'Invalid month format. Use YYYY-MM.'
#             }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)