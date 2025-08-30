from rest_framework import serializers
from ..models import *
from ..serializers.inventory_serlializers import InventorySerializers
from apps.administration.serializers.staff_serializers import StaffFullSerializer




class CommodityListSerializers(serializers.ModelSerializer):
    class Meta:
        model = CommodityList
        fields = '__all__'
         
        
class CommodityInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    com_detail = CommodityListSerializers(source='com_id', read_only=True)  
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    com_id = serializers.PrimaryKeyRelatedField(queryset=CommodityList.objects.all())
    # cat_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = CommodityInventory
        fields = '__all__'

    # def to_internal_value(self, data):
    #     """Allow partial updates but require all fields for creation."""
    #     if self.instance:
    #         # Partial update: Allow missing fields
    #         for field in self.fields:
    #             if field not in data:
    #                 self.fields[field].required = False
    #     return super().to_internal_value(data)

class CommodityTransactionSerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)
    cinv_detail = CommodityInventorySerializer(source='cinv_id', read_only=True)
    com_detail = CommodityListSerializers(source='com_id', read_only=True)

    staff_detail = StaffFullSerializer(source='staff', read_only=True)

    com_name = serializers.CharField(source='cinv_id.com_id.com_name', read_only=True)

    # Write-only fields for creation
    inv_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(), write_only=True, required=False
    )
    com_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicinelist.objects.all(), write_only=True, required=False
    )
   

    class Meta:
        model = CommodityTransaction
        fields = '__all__'
        