
from rest_framework import generics
from ..models import *
from ..serializers.commodity_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from calendar import monthrange
from rest_framework.pagination import PageNumberPagination
from datetime import date
from pagination import StandardResultsPagination
import re



class CommodityListView(generics.ListCreateAPIView):
    serializer_class=CommodityListSerializers
    queryset=CommodityList.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class CommodityListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityListSerializers
    queryset = CommodityList.objects.all()
    lookup_field='com_id'
    
    def get_object(self):
       com_id = self.kwargs.get('com_id')
       obj = get_object_or_404(CommodityList, com_id = com_id)
       return obj
class DeleteCommodityView(generics.DestroyAPIView):
    serializer_class = CommodityListSerializers    
    queryset = CommodityList.objects.all()
    lookup_field = 'com_id'
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
            
class CommodityInventoryVIew(generics.ListCreateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset=CommodityInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
    
class CommodityInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset = CommodityInventory.objects.all()
    lookup_field='cinv_id'
    
    def get_object(self):
       cinv_id = self.kwargs.get('cinv_id')
       obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
       return obj


class ArhiveCommodityInventoryVIew(generics.ListCreateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset=CommodityInventory.objects.all()
    
    def get_queryset(self):
        queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
class CommodityTransactionView(generics.ListCreateAPIView):
    serializer_class=CommodityTransactionSerializer
    queryset=CommodityTransaction.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    

# ============================ COMMODITY REPORT =====================

class CommoditySummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = CommodityTransaction.objects.all()

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
                    }, status=400)

            # Get distinct months only
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

                start_date = month_date.date()
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)

                # Transactions within month
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )

                # Count distinct commodity+inventory combos for this month
                total_items = month_transactions.values(
                    "cinv_id__com_id",
                    "cinv_id__inv_id"
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
            }, status=200)

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)



class MonthlyCommodityRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = CommodityInventorySerializer
    pagination_class = StandardResultsPagination

    def list(self, request, *args, **kwargs):
        month_str = self.kwargs.get('month')  # e.g. '2025-08'
        try:
            year, month = map(int, month_str.split('-'))
        except (ValueError, AttributeError):
            return Response({"error": "Invalid month format"}, status=400)

        # Use date only for filtering to avoid timezone warnings
        start_of_month = date(year, month, 1)
        last_day = monthrange(year, month)[1]
        end_of_month = date(year, month, last_day)

        inventory_summary = []

        # Unique commodity + expiry_date combos within or before month end
        com_expiry_pairs = CommodityTransaction.objects.filter(
            created_at__date__lte=end_of_month
        ).values_list(
            "cinv_id__com_id",
            "cinv_id__inv_id__expiry_date"
        ).distinct()

        for com_id, expiry_date in com_expiry_pairs:
            transactions = CommodityTransaction.objects.filter(
                cinv_id__com_id=com_id,
                cinv_id__inv_id__expiry_date=expiry_date
            ).order_by('created_at')

            first_tx = transactions.select_related("cinv_id__com_id", "cinv_id__inv_id").first()
            if not first_tx:
                continue

            unit = first_tx.cinv_id.cinv_qty_unit
            pcs_per_box = first_tx.cinv_id.cinv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before month start (added minus deducted)
            opening_in = transactions.filter(
                created_at__date__lt=start_of_month,
                comt_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_of_month,
                comt_action__icontains="deduct"
            )
            opening_qty = sum(self._parse_qty(t) for t in opening_in) - sum(self._parse_qty(t) for t in opening_out)

            # No extra multiplication here (boxes are counted as pcs per transaction)

            # Received during the month
            received_qty = sum(self._parse_qty(t) for t in transactions.filter(
                created_at__date__gte=start_of_month,
                created_at__date__lte=end_of_month,
                comt_action__icontains="added"
            ))

            # Dispensed during the month
            dispensed_qty = sum(self._parse_qty(t) for t in transactions.filter(
                created_at__date__gte=start_of_month,
                created_at__date__lte=end_of_month,
                comt_action__icontains="deduct"
            ))

            # Opening displayed includes received during the month
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            # Display unit as "pcs" if boxes
            display_unit = "pcs" if unit and unit.lower() == "boxes" else unit

            inventory_summary.append({
                'com_name': first_tx.cinv_id.com_id.com_name,
                'opening': display_opening,
                'received': received_qty,
                'receivedfrom': first_tx.cinv_id.cinv_recevFrom,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': display_unit,
                'expiry': expiry_date,
                'received_from': first_tx.cinv_id.cinv_recevFrom
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
        """Parse quantity number from transaction.comt_qty."""
        match = re.search(r'\d+', str(transaction.comt_qty))
        qty_num = int(match.group()) if match else 0

        # Multiply by pcs if unit is boxes
        if transaction.cinv_id.cinv_qty_unit and transaction.cinv_id.cinv_qty_unit.lower() == "boxes":
            pcs_per_box = transaction.cinv_id.cinv_pcs or 1
            qty_num *= pcs_per_box

        return qty_num

     