from rest_framework import serializers
from ..models import *
from .inventory_serlializers import *
from apps.administration.serializers.staff_serializers import StaffFullSerializer

class MedicineListSerializers(serializers.ModelSerializer):
    catlist = serializers.CharField(source='cat.cat_name', read_only=True) 
    class Meta: 
        model = Medicinelist
        fields = '__all__'
  


class MedicineInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    med_detail = MedicineListSerializers(source='med_id', read_only=True)  
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    med_id = serializers.PrimaryKeyRelatedField(queryset=Medicinelist.objects.all())


    class Meta:
        model = MedicineInventory
        fields = '__all__'

    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:
            # Partial update: Allow missing fields
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    
class MedicineTransactionSerializers(serializers.ModelSerializer):
    # Read-only fields for viewing related details
    inv_detail = InventorySerializers(source='inv_id', read_only=True)
    minv_detail = MedicineInventorySerializer(source='minv_id', read_only=True)
    med_detail = MedicineListSerializers(source='med_id', read_only=True)
    staff_detail = StaffFullSerializer(source='staff', read_only=True)
    med_name = serializers.CharField(source='minv_id.med_id.med_name', read_only=True)

    # Write-only fields for creation
    inv_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(), write_only=True, required=False
    )
    med_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicinelist.objects.all(), write_only=True, required=False
    )
   

    class Meta:
        model = MedicineTransactions
        fields = '__all__'
        