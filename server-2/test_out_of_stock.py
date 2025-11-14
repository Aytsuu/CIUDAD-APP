"""
Test script to manually check out-of-stock notification logic
Run with: python manage.py shell < test_out_of_stock.py
"""
import logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

print("\n" + "="*80)
print("TESTING OUT-OF-STOCK NOTIFICATION SYSTEM")
print("="*80 + "\n")

# Import models
from apps.inventory.models import MedicineInventory
from apps.inventory import task

print("1. Checking for out-of-stock medicines in database...")
out_of_stock = MedicineInventory.objects.filter(
    minv_qty_avail=0,
    inv_id__is_Archived=False
).select_related('med_id', 'inv_id')

print(f"   Found {out_of_stock.count()} out-of-stock medicines\n")

if out_of_stock.exists():
    for medicine in out_of_stock[:3]:  # Check first 3
        item_id = f"medicine_{medicine.minv_id}"
        print(f"   - {medicine.med_id.med_name}")
        print(f"     ID: {item_id}")
        print(f"     Available: {medicine.minv_qty_avail}")
        print(f"     Archived: {medicine.inv_id.is_Archived}")
        
        # Check if already notified
        already_notified = task.has_been_notified(item_id, "OUT_OF_STOCK")
        print(f"     Already notified: {already_notified}")
        
        if not already_notified:
            print(f"     ⚠️ This item should trigger a notification!")
        print()

print("\n2. Testing notification function directly...")
print("   Getting health staff recipients...")
recipients = task.get_health_staff_recipients()
print(f"   Found {len(recipients)} health staff recipients")
if recipients:
    print(f"   Recipient IDs: {recipients[:3]}...")  # Show first 3

print("\n3. Checking signal registration...")
try:
    from apps.inventory import signals
    print("   ✅ Signals module imported successfully")
    print(f"   ✅ _notify_for_instance function: {signals._notify_for_instance}")
    print(f"   ✅ inventory_post_save handler: {signals.inventory_post_save}")
except Exception as e:
    print(f"   ❌ Error importing signals: {e}")

print("\n4. To trigger a real test:")
print("   - Update an existing medicine's minv_qty_avail to 0")
print("   - OR create a new medicine with minv_qty_avail=0")
print("   - Check server logs for 🎯 POST_SAVE SIGNAL triggered messages")
print("\n" + "="*80 + "\n")
