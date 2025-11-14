from datetime import datetime, timedelta
import re
from dateutil.relativedelta import relativedelta
from rest_framework import generics
from rest_framework.response import Response
from apps.vaccination.models import *
from pagination import StandardResultsPagination
from inventory.models import *



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

        # Get unique vaccine + expiry_date + inv_id combos to avoid duplicates
        vaccine_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date
        ).exclude(
            # Exclude items that expired BEFORE this month
            vacStck_id__inv_id__expiry_date__lt=start_date
        ).values_list(
            "vacStck_id__vac_id",
            "vacStck_id__inv_id__expiry_date",
            "vacStck_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_vaccine_combinations = set()

        for vac_id, expiry_date, inv_id in vaccine_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (vac_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_vaccine_combinations:
                continue
                
            seen_vaccine_combinations.add(combo_key)

            # Get the specific vaccine stock
            try:
                vstock = VaccineStock.objects.get(
                    vac_id=vac_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except VaccineStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                vacStck_id=vstock.vacStck_id
            ).order_by("created_at")

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
                monthly_transactions = transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )
                received_vials = calculate_quantities(monthly_transactions, "added")
                dispensed_doses = calculate_quantities(monthly_transactions, "deduct")
                wasted_doses = calculate_quantities(monthly_transactions, "wasted")
                administered_doses = calculate_quantities(monthly_transactions, "administered")

                # Calculate opening balance - only from previous months
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
                # Wasted doses - no vial calculation needed, just show doses
                administered_vials = math.ceil(administered_doses / dose_ml) if administered_doses > 0 else 0

                # Calculate closing - use actual opening balance, not display opening
                total_available_doses = opening_net_doses + received_total_doses
                closing_doses = total_available_doses - dispensed_doses - wasted_doses - administered_doses
                closing_vials = math.ceil(closing_doses / dose_ml) if closing_doses > 0 else 0

                # Check if expired this month
                expired_this_month = (vstock.inv_id.expiry_date and 
                                    start_date <= vstock.inv_id.expiry_date <= end_date)
                
                # Skip if there's no stock and it's not expiring this month
                # Also include items that expired this month even if closing_doses <= 0
                if (closing_doses <= 0 and 
                    (not expiry_date or expiry_date < start_date) and 
                    not expired_this_month and
                    not monthly_transactions.exists() and
                    not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                    continue

                # FIXED: Opening only shows remaining from previous months
                if opening_vials_display > 0 and opening_net_doses > 0:
                    opening_display = f"{int(opening_vials_display)} vials - {int(opening_net_doses)} doses"
                else:
                    opening_display = ""

                # Ensure no negative values
                closing_vials = max(0, closing_vials)
                closing_doses = max(0, closing_doses)

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = f"{received_vials} vials - {received_total_doses} doses" if received_vials > 0 else ""
                dispensed_display = f"{int(dispensed_vials)} vials - {dispensed_doses} doses" if dispensed_doses > 0 else ""
                # Wasted display - doses only, no vial indicator
                wasted_display = f"{wasted_doses} doses" if wasted_doses > 0 else ""
                administered_display = f"{int(administered_vials)} vials - {administered_doses} doses" if administered_doses > 0 else ""

                # If both closing_vials and closing_doses are 0, display empty string for closing
                if closing_vials == 0 and closing_doses == 0:
                    closing_display = ""
                else:
                    closing_display = f"{int(closing_vials)} vials - {int(closing_doses)} doses"

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
                    'closing': closing_display,
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
                monthly_transactions = transactions.filter(
                    created_at__date__gte=start_date,
                    created_at__date__lte=end_date
                )
                received_qty = calculate_quantities(monthly_transactions, "added")
                dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
                wasted_qty = calculate_quantities(monthly_transactions, "wasted")
                administered_qty = calculate_quantities(monthly_transactions, "administered")
                
                opening_qty = opening_in - opening_out - opening_wasted - opening_administered
                
                # Calculate closing correctly
                closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
                
                # Check if expired this month
                expired_this_month = (vstock.inv_id.expiry_date and 
                                    start_date <= vstock.inv_id.expiry_date <= end_date)
                
                # Skip if there's no stock and it's not expiring this month
                # Also include items that expired this month even if closing_qty <= 0
                if (closing_qty <= 0 and 
                    (not expiry_date or expiry_date < start_date) and 
                    not expired_this_month and
                    not monthly_transactions.exists() and
                    not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                    continue

                # FIXED: Opening only shows remaining from previous months
                opening_display = opening_qty if opening_qty > 0 else ""

                # Format received, dispensed, wasted, and administered - display blank if 0
                received_display = received_qty if received_qty > 0 else ""
                dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
                # Wasted display - just the quantity for diluent
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

        # Get unique immunization + expiry_date + inv_id combos to avoid duplicates
        immunization_expiry_inv_pairs = AntigenTransaction.objects.filter(
            created_at__date__lte=end_date
        ).exclude(
            # Exclude items that expired BEFORE this month
            imzStck_id__inv_id__expiry_date__lt=start_date
        ).values_list(
            "imzStck_id__imz_id",
            "imzStck_id__inv_id__expiry_date",
            "imzStck_id__inv_id"
        ).distinct()

        # Track unique combinations to avoid duplicates
        seen_immunization_combinations = set()

        for imz_id, expiry_date, inv_id in immunization_expiry_inv_pairs:
            # Skip if expiry date is before the current month (already expired)
            if expiry_date and expiry_date < start_date:
                continue
                
            # Create a unique key for this combination
            combo_key = (imz_id, expiry_date, inv_id)
            
            # Skip if we've already processed this combination
            if combo_key in seen_immunization_combinations:
                continue
                
            seen_immunization_combinations.add(combo_key)

            # Get the specific immunization stock
            try:
                istock = ImmunizationStock.objects.get(
                    imz_id=imz_id,
                    inv_id__expiry_date=expiry_date,
                    inv_id=inv_id
                )
            except ImmunizationStock.DoesNotExist:
                continue

            transactions = AntigenTransaction.objects.filter(
                imzStck_id=istock.imzStck_id
            ).order_by("created_at")

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

            # Monthly transactions
            monthly_transactions = transactions.filter(
                created_at__date__gte=start_date,
                created_at__date__lte=end_date
            )
            received_qty = calculate_quantities(monthly_transactions, "added")
            dispensed_qty = calculate_quantities(monthly_transactions, "deduct")
            wasted_qty = calculate_quantities(monthly_transactions, "wasted")
            administered_qty = calculate_quantities(monthly_transactions, "administered")

            opening_qty = opening_in - opening_out - opening_wasted - opening_administered
            
            # Calculate closing correctly
            closing_qty = opening_qty + received_qty - dispensed_qty - wasted_qty - administered_qty
            
            # Check if expired this month
            expired_this_month = (istock.inv_id.expiry_date and 
                                start_date <= istock.inv_id.expiry_date <= end_date)
            
            # Skip if there's no stock and it's not expiring this month
            # Also include items that expired this month even if closing_qty <= 0
            if (closing_qty <= 0 and 
                (not expiry_date or expiry_date < start_date) and 
                not expired_this_month and
                not monthly_transactions.exists() and
                not transactions.filter(created_at__date__gte=start_date, created_at__date__lte=end_date).exists()):
                continue

            if istock.imzStck_unit.lower() == "boxes":
                pcs_per_box = istock.imzStck_per_pcs or 1
                opening_qty *= pcs_per_box
                received_qty *= pcs_per_box
                dispensed_qty *= pcs_per_box
                wasted_qty *= pcs_per_box
                administered_qty *= pcs_per_box

            # FIXED: Opening only shows remaining from previous months
            opening_display = opening_qty if opening_qty > 0 else ""

            # Format received, dispensed, wasted, and administered - display blank if 0
            received_display = received_qty if received_qty > 0 else ""
            dispensed_display = dispensed_qty if dispensed_qty > 0 else ""
            # Wasted display - just the quantity for immunizations
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