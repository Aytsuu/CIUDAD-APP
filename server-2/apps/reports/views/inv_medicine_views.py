

from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError, Q, Sum
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from pagination import *
import re
from calendar import monthrange
from apps.medicineservices.models import MedicineInventory, MedicineTransactions
from apps.medicineservices.serializers import MedicineInventorySerializer


    
            
# ==================MEDICINE REPORT=======================
class MedicineSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            queryset = MedicineTransactions.objects.all()

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

                # Filter transactions for this month - EXCLUDE expired items
                month_transactions = queryset.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                ).exclude(
                    # Exclude items that expired BEFORE this month
                    minv_id__inv_id__expiry_date__lt=start_date
                )

                # Count distinct medicine+inventory combos
                total_items = month_transactions.values(
                    "minv_id__med_id",
                    "minv_id__inv_id"
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

            
class MonthlyMedicineRecordsDetailAPIView(generics.ListAPIView):
    serializer_class = MedicineInventorySerializer
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

        # Get unique medicine + expiry_date + inv_id combos to avoid duplicates
        med_expiry_inv_pairs = MedicineTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "minv_id__med_id",
            "minv_id__inv_id__expiry_date",
            "minv_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_combinations = set()

        for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (med_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_combinations:
                continue
                
            seen_combinations.add(combo_key)

            transactions = MedicineTransactions.objects.filter(
                minv_id__med_id=med_id,
                minv_id__inv_id__expiry_date=expiry_date,
                minv_id__inv_id=inv_id
            ).order_by("created_at")

            first_tx = transactions.select_related("minv_id__med_id", "minv_id__inv_id").first()
            if not first_tx:
                continue

            unit = first_tx.minv_id.minv_qty_unit
            pcs_per_box = first_tx.minv_id.minv_pcs if unit and unit.lower() == "boxes" else 1

            # Opening stock before start_date
            opening_in = transactions.filter(
                created_at__date__lt=start_date,
                mdt_action__icontains="added"
            )
            opening_out = transactions.filter(
                created_at__date__lt=start_date,
                mdt_action__icontains="deduct"
            )
            opening_qty = (sum(self._parse_qty(t) for t in opening_in) -
                           sum(self._parse_qty(t) for t in opening_out))

            if unit and unit.lower() == "boxes":
                opening_qty *= pcs_per_box

            # Received during the month
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date,
                mdt_action__icontains="added"
            )
            received_qty = sum(self._parse_qty(t) for t in monthly_transactions)
            if unit and unit.lower() == "boxes":
                received_qty *= pcs_per_box

            # Dispensed during the month
            dispensed_qty = sum(
                self._parse_qty(t) for t in transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date,
                    mdt_action__icontains="deduct"
                )
            )

            # Opening displayed includes received
            display_opening = opening_qty + received_qty
            closing_qty = display_opening - dispensed_qty

            # Check if expired this month
            expired_this_month = (first_tx.minv_id.inv_id.expiry_date and 
                                start_date <= first_tx.minv_id.inv_id.expiry_date <= end_date)
            
            # REMOVED: Don't set closing to 0 for expired items
            # if expired_this_month:
            #     closing_qty = 0
            
            # Skip if there's no stock and it's not expiring this month
            # Also include items that expired this month even if closing_qty <= 0
            if closing_qty <= 0 and (not expiry_date or expiry_date > end_date) and not expired_this_month:
                continue

            inventory_summary.append({
                'med_name': f"{first_tx.minv_id.med_id.med_name} {first_tx.minv_id.minv_dsg}{first_tx.minv_id.minv_dsg_unit} {first_tx.minv_id.minv_form}",
                'opening': display_opening,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing': closing_qty,
                'unit': "pcs",
                'expiry': first_tx.minv_id.inv_id.expiry_date,
                'expired_this_month': expired_this_month,
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
        """Extract numeric value from mdt_qty."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        return int(match.group()) if match else 0   
    
    
    
#======================== EXPIRED AND OUT OF STOCK REPORT=========================
class MedicineExpiredOutOfStockSummaryAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from mdt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        qty_num = int(match.group()) if match else 0
        
        if (multiply_boxes and 
            transaction.minv_id.minv_qty_unit and 
            transaction.minv_id.minv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.minv_id.minv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request):
        try:
            # Get distinct months from medicine transactions
            distinct_months = MedicineTransactions.objects.annotate(
                month=TruncMonth('created_at')
            ).values('month').distinct().order_by('-month')

            formatted_months = []

            for item in distinct_months:
                month_date = item['month']
                if not month_date:
                    continue
                    
                month_str = month_date.strftime('%Y-%m')
                month_name = month_date.strftime('%B %Y')

                # Get the date range for this month
                start_date = month_date.date()
                last_day = monthrange(start_date.year, start_date.month)[1]
                end_date = start_date.replace(day=last_day)
                near_expiry_threshold = end_date + timedelta(days=30)

                # Get all medicine inventory items that were active up to this month
                med_expiry_inv_pairs = MedicineTransactions.objects.filter(
                    created_at__date__lte=end_date
                ).values_list(
                    "minv_id__med_id",
                    "minv_id__inv_id__expiry_date",
                    "minv_id__inv_id"
                ).distinct()

                expired_count = 0
                out_of_stock_count = 0
                expired_out_of_stock_count = 0
                near_expiry_count = 0

                seen_combinations = set()

                for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
                    # Create a unique key for this combination
                    combo_key = (med_id, expiry_date, inv_id)
                    if combo_key in seen_combinations:
                        continue
                    seen_combinations.add(combo_key)

                    # Skip if no expiry date (can't be expired or near expiry)
                    if not expiry_date:
                        continue

                    # Skip if expired BEFORE current month
                    if expiry_date < start_date:
                        continue

                    transactions = MedicineTransactions.objects.filter(
                        minv_id__med_id=med_id,
                        minv_id__inv_id__expiry_date=expiry_date,
                        minv_id__inv_id=inv_id
                    ).order_by("created_at")

                    # Calculate stock levels
                    opening_in = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="added")
                    opening_out = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="deduct")
                    opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

                    monthly_transactions = transactions.filter(
                        created_at__date__gte=start_date,
                        created_at__date__lte=end_date
                    )
                    received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(mdt_action__icontains="added"))
                    dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(mdt_action__icontains="deduct"))

                    closing_qty = opening_qty + received_qty - dispensed_qty

                    # Check conditions
                    is_expired = start_date <= expiry_date <= end_date
                    is_out_of_stock = closing_qty <= 0
                    is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

                    if is_expired and is_out_of_stock:
                        expired_out_of_stock_count += 1
                    elif is_expired:
                        expired_count += 1
                    elif is_out_of_stock:
                        out_of_stock_count += 1
                    elif is_near_expiry:
                        near_expiry_count += 1

                total_problems = expired_count + out_of_stock_count + expired_out_of_stock_count + near_expiry_count

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_problems': total_problems,
                    'expired_count': expired_count,
                    'out_of_stock_count': out_of_stock_count,
                    'expired_out_of_stock_count': expired_out_of_stock_count,
                    'near_expiry_count': near_expiry_count,
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
        
        
class MonthlyMedicineExpiredOutOfStockDetailAPIView(APIView):
    pagination_class = StandardResultsPagination

    def _parse_qty(self, transaction, multiply_boxes=False):
        """Extract numeric value from mdt_qty and convert boxes to pieces if needed."""
        match = re.search(r'\d+', str(transaction.mdt_qty))
        qty_num = int(match.group()) if match else 0
        
        # If it's a box unit AND we need to multiply, convert to pieces
        if (multiply_boxes and 
            transaction.minv_id.minv_qty_unit and 
            transaction.minv_id.minv_qty_unit.lower() == "boxes"):
            pcs_per_box = transaction.minv_id.minv_pcs or 1
            qty_num *= pcs_per_box
            
        return qty_num

    def get(self, request, *args, **kwargs):
        month_str = self.kwargs['month']  # Format: YYYY-MM
        try:
            year, month = map(int, month_str.split('-'))
        except ValueError:
            return Response({"error": "Invalid month format"}, status=400)

        start_date = datetime(year, month, 1).date()
        end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)
        near_expiry_threshold = end_date + timedelta(days=30)  # 1 month after end of current month

        expired_items = []
        out_of_stock_items = []
        expired_out_of_stock_items = []
        near_expiry_items = []  # New category for near expiry

        # Get all medicine inventory items that were active up to this month
        med_expiry_inv_pairs = MedicineTransactions.objects.filter(
            created_at__date__lte=end_date
        ).values_list(
            "minv_id__med_id",
            "minv_id__inv_id__expiry_date",
            "minv_id__inv_id"
        ).distinct()

        seen_combinations = set()

        for med_id, expiry_date, inv_id in med_expiry_inv_pairs:
            # Create a unique key for this combination
            combo_key = (med_id, expiry_date, inv_id)
            if combo_key in seen_combinations:
                continue
            seen_combinations.add(combo_key)

            # Skip if no expiry date
            if not expiry_date:
                continue

            # Skip if expired BEFORE current month
            if expiry_date < start_date:
                continue

            try:
                minv = MedicineInventory.objects.get(
                    med_id=med_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except MedicineInventory.DoesNotExist:
                continue

            transactions = MedicineTransactions.objects.filter(
                minv_id__med_id=med_id,
                minv_id__inv_id__expiry_date=expiry_date,
                minv_id__inv_id=inv_id
            ).order_by("created_at")

            # Get unit information
            unit = minv.minv_qty_unit
            pcs_per_box = minv.minv_pcs if unit and unit.lower() == "boxes" else 1

            # Calculate stock levels - multiply boxes for added quantities
            opening_in = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="added")
            opening_out = transactions.filter(created_at__date__lt=start_date, mdt_action__icontains="deduct")
            opening_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in opening_in) - sum(self._parse_qty(t, multiply_boxes=False) for t in opening_out)

            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            # Multiply boxes for received items
            received_qty = sum(self._parse_qty(t, multiply_boxes=True) for t in monthly_transactions.filter(mdt_action__icontains="added"))
            # Don't multiply boxes for dispensed items (they're already in pieces)
            dispensed_qty = sum(self._parse_qty(t, multiply_boxes=False) for t in monthly_transactions.filter(mdt_action__icontains="deduct"))

            closing_qty = opening_qty + received_qty - dispensed_qty

            # Check conditions
            is_expired = start_date <= expiry_date <= end_date
            is_out_of_stock = closing_qty <= 0
            is_near_expiry = (end_date < expiry_date <= near_expiry_threshold) and closing_qty > 0

            item_data = {
                'med_name': f"{minv.med_id.med_name} {minv.minv_dsg}{minv.minv_dsg_unit} {minv.minv_form}",
                'expiry_date': expiry_date.strftime('%Y-%m-%d') if expiry_date else 'No expiry',
                'opening_stock': opening_qty,
                'received': received_qty,
                'dispensed': dispensed_qty,
                'closing_stock': closing_qty,
                'unit': 'pcs',
                'status': 'Expired' if is_expired else 'Out of Stock' if is_out_of_stock else 'Near Expiry' if is_near_expiry else 'Active'
            }

            if is_expired and is_out_of_stock:
                expired_out_of_stock_items.append(item_data)
            elif is_expired:
                expired_items.append(item_data)
            elif is_out_of_stock:
                out_of_stock_items.append(item_data)
            elif is_near_expiry:
                near_expiry_items.append(item_data)

        # Combine all items (including near expiry in problem items)
        all_problem_items = expired_items + out_of_stock_items + expired_out_of_stock_items + near_expiry_items

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'summary': {
                    'total_problems': len(all_problem_items),
                    'expired_count': len(expired_items),
                    'out_of_stock_count': len(out_of_stock_items),
                    'expired_out_of_stock_count': len(expired_out_of_stock_items),
                    'near_expiry_count': len(near_expiry_items),  # New count
                },
                'expired_items': expired_items,
                'out_of_stock_items': out_of_stock_items,
                'expired_out_of_stock_items': expired_out_of_stock_items,
                'near_expiry_items': near_expiry_items,  # New category
                'all_problem_items': all_problem_items
            }
        })  
        