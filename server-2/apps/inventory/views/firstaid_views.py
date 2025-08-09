from rest_framework import generics
from ..models import *
from ..serializers.firstaid_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError
from rest_framework.views import APIView
from pagination import StandardResultsPagination
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import re
from django.db.models.functions import TruncMonth


 
      
class FirstAidListView(generics.ListCreateAPIView):
    serializer_class=FirstAidListSerializers
    queryset=FirstAidList.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
     
class FirstAidListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidListSerializers
    queryset = FirstAidList.objects.all()
    lookup_field='fa_id'
    
    def get_object(self):
       fa_id = self.kwargs.get('fa_id')
       obj = get_object_or_404(FirstAidList, fa_id = fa_id)
       return obj

class DeleteFirstAidView(generics.DestroyAPIView):
    serializer_class = FirstAidListSerializers    
    queryset = FirstAidList.objects.all()
    lookup_field = 'fa_id'
    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
            
class FirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
    
class FirstAidInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
    lookup_field='finv_id'
    
    def get_object(self):
       finv_id = self.kwargs.get('finv_id')
       obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
       return obj
    
class ArchiveFirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
   
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
class FirstAidTransactionView(generics.ListCreateAPIView):
    serializer_class=FirstTransactionSerializer
    queryset=FirstAidTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     

# ==================FIRST AID REPORT=======================

class FirstAidSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = FirstAidTransactions.objects.all()

            search_query = request.GET.get('search', '').strip().lower()
            year_param = request.GET.get('year', 'all')

            if year_param and year_param != 'all':
                try:
                    if '-' in year_param:
                        year, month = map(int, year_param.split('-'))
                        queryset = queryset.filter(
                            created_at__year=year,
                            created_at__month=month
                        )
                    else:
                        year = int(year_param)
                        queryset = queryset.filter(created_at__year=year)
                except ValueError:
                    return Response({
                        'success': False,
                        'error': 'Invalid year format. Use YYYY or YYYY-MM.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Get distinct months in queryset, sorted descending
            distinct_months = queryset.annotate(
                month=TruncMonth('created_at')
            ).values('month').distinct().order_by('-month')

            formatted_months = []

            for item in distinct_months:
                month_date = item['month']
                if not month_date:
                    continue
                month_str = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')

                if search_query and search_query not in month_name.lower():
                    continue

                # Get the date range for this month
                start_date = month_date.date()
                from calendar import monthrange
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)

                # Filter transactions for this month
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )

                # Count distinct firstaid+inventory combos
                total_items = month_transactions.values(
                    "finv_id__fa_id",
                    "finv_id__inv_id"
                ).distinct().count()

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_items': total_items,
                })

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(formatted_months, request)
            if page is not None:
                return paginator.get_paginated_response({
                    'success': True,
                    'data': page,
                    'total_months': len(formatted_months),
                })

            return Response({
                'success': True,
                'data': formatted_months,
                'total_months': len(formatted_months),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

  
  
class MonthlyFirstAidRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = FirstAidInventorySerializer
    pagination_class = StandardResultsPagination

    def list(self, request, *args, **kwargs):
        month_str = self.kwargs['month']  # Format: YYYY-MM
        try:
            year, month = map(int, month_str.split('-'))
        except ValueError:
            return Response({"error": "Invalid month format"}, status=400)

        start_date = datetime(year, month, 1).date()
        end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)

        inventory_summary = []

        # Get all unique first aid inventory items that have transactions (using correct related_name)
        fa_inv_items = FirstAidInventory.objects.filter(
            firstaidtransactions__created_at__date__lte=end_date
        ).select_related(
            'fa_id', 'inv_id'
        ).distinct()

        for finv in fa_inv_items:
            transactions = FirstAidTransactions.objects.filter(
                finv_id=finv.finv_id
            ).order_by("created_at")

            unit = finv.finv_qty_unit
            pcs_per_box = finv.finv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before start_date
            opening_in = transactions.filter(
                created_at__date__lt=start_date,
                fat_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_date,
                fat_action__icontains="deduct"
            )
            opening_qty = (sum(self._parse_qty(t) for t in opening_in) -
                         sum(self._parse_qty(t) for t in opening_out))

            if unit and unit.lower() == "boxes":
                opening_qty *= pcs_per_box

            # Received during the month
            received_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    fat_action__icontains="added"
                )
            )
            if unit and unit.lower() == "boxes":
                received_qty *= pcs_per_box

            # Dispensed during the month
            dispensed_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    fat_action__icontains="deduct"
                )
            )

            # Opening displayed includes received
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            inventory_summary.append({
                'finv_id': finv.finv_id,
                'inv_id': finv.inv_id_id,
                'fa_name': finv.fa_id.fa_name,
                'opening': display_opening,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': "pcs",
                'expiry': finv.inv_id.expiry_date.strftime('%Y-%m-%d') if finv.inv_id.expiry_date else None,
            })

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': inventory_summary,
                'total_items': len(inventory_summary)
            }
        })

    def _parse_qty(self, transaction):
        """Extract numeric value from fat_qty."""
        match = re.search(r'\d+', str(transaction.fat_qty))
        return int(match.group()) if match else 0