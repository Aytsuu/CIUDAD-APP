from rest_framework import generics
from ..models import *
from ..serializers.vaccine_serializers import *
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db.models import ProtectedError
from pagination import StandardResultsPagination
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
import re
from django.db.models import Q



class AgeGroupView(generics.ListCreateAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
    
    
class DeleteUpdateAgeGroupView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
    lookup_field = 'agegrp_id'
    def get_object(self):
        agegrp_id = self.kwargs.get('agegrp_id')
        return get_object_or_404(Agegroup, agegrp_id=agegrp_id)
    



class ImmunizationSuppliesView(generics.ListCreateAPIView):
    serializer_class=ImmunizationSuppliesSerializer
    queryset=ImmunizationSupplies.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# views.py
class VaccineListView(generics.ListCreateAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()

    def create(self, request, *args, **kwargs):
        vac_name = request.data.get('vac_name')

        # Check if vaccine already exists for that age group
        if VaccineList.objects.filter(vac_name__iexact=vac_name).exists():
            return Response(
                {"detail": "This vaccine already exists for the selected age group."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

class VaccineIntervalView(generics.ListCreateAPIView):
    serializer_class=VaccineIntervalSerializer
    queryset=VaccineInterval.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class RoutineFrequencyView(generics.ListCreateAPIView):
    serializer_class=RoutineFrequencySerializer
    queryset=RoutineFrequency.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     
     
    
# Immunization Supplies Views
class ImmunizationSuppliesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    queryset = ImmunizationSupplies.objects.all()
    lookup_field = 'imz_id'
    
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Cannot delete medicine. It is still in use by other records.")
        
        
# Vaccine List Views
class VaccineListRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()
    lookup_field = 'vac_id'
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
            
class ConditionalVaccineListView(generics.ListCreateAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
class ConditionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
    lookup_field = 'vac_id'
    def get_object(self):
        vac_id = self.kwargs.get('vac_id')
        obj = get_object_or_404(ConditionalVaccine, vac_id=vac_id)
        return obj
# Vaccine Interval Views
class VaccineIntervalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineIntervalSerializer
    queryset = VaccineInterval.objects.all()
    lookup_field = 'vacInt_id'
    
    def get_object(self):
        vacInt_id = self.kwargs.get('vacInt_id')
        obj = get_object_or_404(VaccineInterval, vacInt_id=vacInt_id)
        return obj

# Routine Frequency Views
class RoutineFrequencyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RoutineFrequencySerializer
    queryset = RoutineFrequency.objects.all()
    lookup_field = 'routineF_id'
    
    def get_object(self):
        routineF_id = self.kwargs.get('routineF_id')
        obj = get_object_or_404(RoutineFrequency, routineF_id=routineF_id)
        return obj
    

 
class VaccineStocksView(generics.ListCreateAPIView):
    serializer_class=VaccineStockSerializer
    queryset=VaccineStock.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset 
    
class VaccineStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineStockSerializer
    queryset = VaccineStock.objects.all()
    lookup_field = 'vacStck_id'
    def get_object(self):
        vacStck_id = self.kwargs.get('vacStck_id')
        obj = get_object_or_404(VaccineStock, vacStck_id=vacStck_id)
        return obj
    
# class VaccineStockVacRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VaccineStockSerializer
#     queryset = VaccineStock.objects.all()
#     lookup_field = 'vac_id'
#     def get_object(self):
#         vac_id = self.kwargs.get('vac_id')
#         obj = get_object_or_404(VaccineStock, vac_id=vac_id)
#         return obj
    
    
    
class ImmunizationStockSuppliesView(generics.ListCreateAPIView):
    serializer_class=ImmnunizationStockSuppliesSerializer
    queryset=ImmunizationStock.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        queryset = ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
class AntigenTransactionView(generics.ListCreateAPIView):
    serializer_class = AntigenTransactionSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return AntigenTransaction.objects.all().order_by('-created_at')  # or any logic

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    
class ImmunizationTransactionView(generics.ListCreateAPIView):
    serializer_class=ImmunizationSuppliesTransactionSerializer
    # queryset=ImmunizationTransaction.objects.all() 
    pagination_class = StandardResultsPagination
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# Immunization Supplies Views
class ImmunizationSuppliesStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmnunizationStockSuppliesSerializer
    queryset = ImmunizationStock.objects.all()
    lookup_field = 'imzStck_id'
    
    def get_object(self):
        imzStck_id = self.kwargs.get('imzStck_id')
        obj = get_object_or_404(ImmunizationStock, imzStck_id=imzStck_id)
        return obj
    

# Immunization Supplies Views
class ArchiveImmunizationSuppliesStockListView(generics.ListAPIView):
    serializer_class = ImmnunizationStockSuppliesSerializer
    queryset = ImmunizationStock.objects.all()
    
    def get_queryset(self):
        # Filter to only include records where inv_id__is_Archived is True
        return ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)

class ArchiveVaccineStocksView(generics.ListAPIView):
    serializer_class=VaccineStockSerializer
    queryset=VaccineStock.objects.all()
   
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset 
    
    

# ==================VACCINATION/IMMUNIZATION REPORT=======================

class VaccinationSummaryMonthsAPIView(APIView):
    pagination_class = StandardResultsPagination

    def get(self, request):
        try:
            # Get transactions for both vaccine and immunization
            queryset = AntigenTransaction.objects.all()

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

                # Count vaccine items (with transactions OR expired in this month)
                vaccine_with_transactions = VaccineStock.objects.filter(
                    antigen_transactions__created_at__date__gte=start_date,
                    antigen_transactions__created_at__date__lte=end_date
                ).distinct().count()
                
                vaccine_expired_this_month = VaccineStock.objects.filter(
                    inv_id__expiry_date__gte=start_date,
                    inv_id__expiry_date__lte=end_date
                ).exclude(
                    inv_id__expiry_date__lt=start_date  # Exclude items expired before this month
                ).distinct().count()
                
                # Count immunization items (with transactions OR expired in this month)
                immunization_with_transactions = ImmunizationStock.objects.filter(
                    antigen_transactions__created_at__date__gte=start_date,
                    antigen_transactions__created_at__date__lte=end_date
                ).distinct().count()
                
                immunization_expired_this_month = ImmunizationStock.objects.filter(
                    inv_id__expiry_date__gte=start_date,
                    inv_id__expiry_date__lte=end_date
                ).exclude(
                    inv_id__expiry_date__lt=start_date  # Exclude items expired before this month
                ).distinct().count()

                # Get unique vaccine items (either with transactions or expired)
                vaccine_items_with_tx_or_expired = VaccineStock.objects.filter(
                    Q(antigen_transactions__created_at__date__gte=start_date,
                      antigen_transactions__created_at__date__lte=end_date) |
                    Q(inv_id__expiry_date__gte=start_date,
                      inv_id__expiry_date__lte=end_date)
                ).exclude(
                    inv_id__expiry_date__lt=start_date  # Exclude items expired before this month
                ).distinct().count()

                # Get unique immunization items (either with transactions or expired)
                immunization_items_with_tx_or_expired = ImmunizationStock.objects.filter(
                    Q(antigen_transactions__created_at__date__gte=start_date,
                      antigen_transactions__created_at__date__lte=end_date) |
                    Q(inv_id__expiry_date__gte=start_date,
                      inv_id__expiry_date__lte=end_date)
                ).exclude(
                    inv_id__expiry_date__lt=start_date  # Exclude items expired before this month
                ).distinct().count()

                total_items = vaccine_items_with_tx_or_expired + immunization_items_with_tx_or_expired

                formatted_months.append({
                    'month': month_str,
                    'month_name': month_name,
                    'total_items': total_items,
                    'vaccine_items': vaccine_items_with_tx_or_expired,
                    'immunization_items': immunization_items_with_tx_or_expired,
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

class MonthlyVaccinationRecordsDetailAPIView(generics.ListAPIView):
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

        # Process Vaccine Stocks - Only get stocks that have transactions in the selected month
        # OR expired in the selected month
        vaccine_stocks = VaccineStock.objects.filter(
            Q(antigen_transactions__created_at__date__gte=start_date,
              antigen_transactions__created_at__date__lte=end_date) |
            Q(inv_id__expiry_date__gte=start_date,
              inv_id__expiry_date__lte=end_date)
        ).select_related('vac_id', 'inv_id').distinct()

        for vstock in vaccine_stocks:
            # Skip if expired before this month (but not in this month)
            if (vstock.inv_id.expiry_date and 
                vstock.inv_id.expiry_date < start_date):
                continue

            transactions = AntigenTransaction.objects.filter(
                vacStck_id=vstock.vacStck_id
            ).order_by("created_at")

            # Check if this stock has any transactions in the selected month
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            
            # Check if expired in this month
            expired_this_month = (vstock.inv_id.expiry_date and 
                                start_date <= vstock.inv_id.expiry_date <= end_date)
            
            # Skip if no transactions in this month AND didn't expire in this month
            if not monthly_transactions.exists() and not expired_this_month:
                continue

            # Check if this is a vaccine (doses) or diluent
            is_doses = vstock.solvent.lower() != 'diluent'
            dose_ml = vstock.dose_ml if (is_doses and vstock.dose_ml and vstock.dose_ml > 0) else 1

            def calculate_quantities(qs, action):
                return sum(
                    int(re.search(r'\d+', str(t.antt_qty)).group()) if re.search(r'\d+', str(t.antt_qty)) else 0
                    for t in qs.filter(antt_action__icontains=action)
                )

            if is_doses:
                # For vaccine doses
                import math
                
                # Opening balance calculations (before the month)
                opening_vials_added = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "added")
                opening_doses_deducted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "deduct")
                opening_doses_wasted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "wasted")
                opening_doses_administered = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "administered")
                
                # Monthly transactions
                received_vials = calculate_quantities(monthly_transactions, "added")
                dispensed_doses = calculate_quantities(monthly_transactions, "deduct")
                wasted_doses = calculate_quantities(monthly_transactions, "wasted")
                administered_doses = calculate_quantities(monthly_transactions, "administered")

                # Calculate opening balance
                opening_total_doses = opening_vials_added * dose_ml
                opening_net_doses = opening_total_doses - opening_doses_deducted - opening_doses_wasted - opening_doses_administered
                
                # Calculate actual opening vials for display - use ceil to get minimum vials needed
                if opening_net_doses <= 0:
                    opening_vials_display = 0
                    opening_net_doses = 0
                else:
                    # Use ceil to get minimum vials needed to hold the opening doses
                    opening_vials_display = math.ceil(opening_net_doses / dose_ml)

                # Calculate display values
                received_total_doses = received_vials * dose_ml
                dispensed_vials = math.ceil(dispensed_doses / dose_ml) if dispensed_doses > 0 else 0
                wasted_vials = math.ceil(wasted_doses / dose_ml) if wasted_doses > 0 else 0
                administered_vials = math.ceil(administered_doses / dose_ml) if administered_doses > 0 else 0

                # Calculate closing - use actual opening balance, not display opening
                total_available_doses = opening_net_doses + received_total_doses
                closing_doses = total_available_doses - dispensed_doses - wasted_doses - administered_doses
                closing_vials = math.ceil(closing_doses / dose_ml) if closing_doses > 0 else 0

                # If expired this month, set closing to 0
                if expired_this_month:
                    closing_vials = 0
                    closing_doses = 0

                # If opening was 0 but we received, show received in opening for display only
                if opening_vials_display == 0 and received_vials > 0:
                    opening_display = f"{received_vials} vials - {received_total_doses} doses"
                else:
                    opening_display = f"{int(opening_vials_display)} vials - {int(opening_net_doses)} doses"

                # Ensure no negative values
                closing_vials = max(0, closing_vials)
                closing_doses = max(0, closing_doses)

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = f"{received_vials} vials - {received_total_doses} doses" if received_vials > 0 else ""
                dispensed_display = f"{int(dispensed_vials)} vials - {dispensed_doses} doses" if dispensed_doses > 0 else ""
                wasted_display = f"{int(wasted_vials)} vials - {wasted_doses} doses" if wasted_doses > 0 else ""
                administered_display = f"{int(administered_vials)} vials - {administered_doses} doses" if administered_doses > 0 else ""

                item_data = {
                    'id': vstock.vacStck_id,
                    'type': 'vaccine',
                    'name': vstock.vac_id.vac_name,
                    'batch_number': vstock.batch_number,
                    'solvent': vstock.solvent,
                    'opening': opening_display,
                    'received': received_display,
                    'dispensed': dispensed_display,
                    'wasted': wasted_display,
                    'administered': administered_display,
                    'closing': f"{int(closing_vials)} vials - {int(closing_doses)} doses",
                    'unit': 'doses',
                    'dose_ml': dose_ml,
                    'expiry': vstock.inv_id.expiry_date.strftime('%Y-%m-%d') if vstock.inv_id.expiry_date else None,
                    'expired_this_month': expired_this_month,
                }

            else:
                # For diluent (containers) 
                opening_in = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "added")
                opening_out = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "deduct")
                opening_wasted = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "wasted")
                opening_administered = calculate_quantities(
                    transactions.filter(created_at__date__lt=start_date), "administered")
                
                # Monthly transactions
                received_qty = calculate_quantities(monthly_transactions, "added")
                dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
                wasted_qty = calculate_quantities(monthly_transactions, "wasted")
                administered_qty = calculate_quantities(monthly_transactions, "administered")
                
                opening_qty = opening_in - opening_out - opening_wasted - opening_administered
                
                # Calculate closing correctly
                closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
                
                # If expired this month, set closing to 0
                if expired_this_month:
                    closing_qty = 0
                
                # If no opening balance but received in this month, show received as opening for display only
                if opening_qty <= 0 and received_qty > 0:
                    opening_display = received_qty
                else:
                    opening_display = opening_qty

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = received_qty if received_qty > 0 else ""
                dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
                wasted_display = wasted_qty if wasted_qty > 0 else ""
                administered_display = administered_qty if administered_qty > 0 else ""

                item_data = {
                    'id': vstock.vacStck_id,
                    'type': 'vaccine',
                    'name': vstock.vac_id.vac_name,
                    'batch_number': vstock.batch_number,
                    'solvent': vstock.solvent,
                    'opening': opening_display,
                    'received': received_display,
                    'dispensed': dispensed_display,
                    'wasted': wasted_display,
                    'administered': administered_display,
                    'closing': closing_qty,
                    'unit': 'container',
                    'expiry': vstock.inv_id.expiry_date.strftime('%Y-%m-%d') if vstock.inv_id.expiry_date else None,
                    'expired_this_month': expired_this_month,
                }

            inventory_summary.append(item_data)

        # Process Immunization Stocks - Only get stocks that have transactions in the selected month
        # OR expired in the selected month
        immunization_stocks = ImmunizationStock.objects.filter(
            Q(antigen_transactions__created_at__date__gte=start_date,
              antigen_transactions__created_at__date__lte=end_date) |
            Q(inv_id__expiry_date__gte=start_date,
              inv_id__expiry_date__lte=end_date)
        ).select_related('imz_id', 'inv_id').distinct()

        for istock in immunization_stocks:
            # Skip if expired before this month (but not in this month)
            if (istock.inv_id.expiry_date and 
                istock.inv_id.expiry_date < start_date):
                continue

            transactions = AntigenTransaction.objects.filter(
                imzStck_id=istock.imzStck_id
            ).order_by("created_at")

            # Check if this stock has any transactions in the selected month
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            
            # Check if expired in this month
            expired_this_month = (istock.inv_id.expiry_date and 
                                start_date <= istock.inv_id.expiry_date <= end_date)
            
            # Skip if no transactions in this month AND didn't expire in this month
            if not monthly_transactions.exists() and not expired_this_month:
                continue

            def calculate_quantities(qs, action):
                return sum(
                    int(re.search(r'\d+', str(t.antt_qty)).group()) if re.search(r'\d+', str(t.antt_qty)) else 0
                    for t in qs.filter(antt_action__icontains=action)
                )

            opening_in = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "added")
            opening_out = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "deduct")
            opening_wasted = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "wasted")
            opening_administered = calculate_quantities(
                transactions.filter(created_at__date__lt=start_date), "administered")

            received_qty = calculate_quantities(monthly_transactions, "added")
            dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
            wasted_qty = calculate_quantities(monthly_transactions, "wasted")
            administered_qty = calculate_quantities(monthly_transactions, "administered")

            opening_qty = opening_in - opening_out - opening_wasted - opening_administered
            
            # Calculate closing correctly
            closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
            
            # If expired this month, set closing to 0
            if expired_this_month:
                closing_qty = 0
            
            # If no opening balance but received in this month, show received as opening for display only
            if opening_qty <= 0 and received_qty > 0:
                opening_display = received_qty
            else:
                opening_display = opening_qty

            if istock.imzStck_unit.lower() == "boxes":
                pcs_per_box = istock.imzStck_per_pcs or 1
                opening_qty *= pcs_per_box
                received_qty *= pcs_per_box
                dispensed_qty *= pcs_per_box
                wasted_qty *= pcs_per_box
                administered_qty *= pcs_per_box

            # Format received, dispensed, wasted, and administered - display blank if 0
            received_display = received_qty if received_qty > 0 else ""
            dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
            wasted_display = wasted_qty if wasted_qty > 0 else ""
            administered_display = administered_qty if administered_qty > 0 else ""

            inventory_summary.append({
                'id': istock.imzStck_id,
                'type': 'immunization',
                'name': istock.imz_id.imz_name,
                'qty': istock.imzStck_qty,
                'batch_number': istock.batch_number,
                'opening': opening_display,
                'received': received_display,
                'dispensed': dispensed_display,
                'wasted': wasted_display,
                'administered': administered_display,
                'closing': closing_qty,
                'unit': 'pcs',
                'expiry': istock.inv_id.expiry_date.strftime('%Y-%m-%d') if istock.inv_id.expiry_date else None,
                'expired_this_month': expired_this_month,
            })

        return Response({
            'success': True,
            'data': {
                'month': month_str,
                'inventory_summary': inventory_summary,
                'total_items': len(inventory_summary),
                'vaccine_items': len([x for x in inventory_summary if x['type'] == 'vaccine']),
                'immunization_items': len([x for x in inventory_summary if x['type'] == 'immunization']),
            }
        })