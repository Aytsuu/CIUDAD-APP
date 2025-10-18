
from rest_framework import serializers
from ..models import *
from apps.inventory.serializers.inventory_serlializers import InventorySerializers
from apps.administration.serializers.staff_serializers import StaffFullSerializer

class FirstAidListSerializers(serializers.ModelSerializer):
    catlist = serializers.CharField(source='cat.cat_name', read_only=True)  # Read-only field for category name
    
    class Meta:
        
        model = FirstAidList
        fields = '__all__'
        

class FirstAidInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    fa_detail = FirstAidListSerializers(source='fa_id', read_only=True)  
    
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    fa_id = serializers.PrimaryKeyRelatedField(queryset=FirstAidList.objects.all())


    class Meta:
        model = FirstAidInventory
        fields = '__all__'
        

    # def to_internal_value(self, data):
    #     """Allow partial updates but require all fields for creation."""
    #     if self.instance:
    #         # Partial update: Allow missing fields
    #         for field in self.fields:
    #             if field not in data:
    #                 self.fields[field].required = False
    #     return super().to_internal_value(data)
    
    
class FirstTransactionSerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)
    finv_detail = FirstAidInventorySerializer(source='finv_id', read_only=True)
    fa_detail = FirstAidListSerializers(source='fa_id', read_only=True)
    fa_name = serializers.CharField(source='finv_id.fa_id.fa_name', read_only=True)
    staff_detail = StaffFullSerializer(source='staff', read_only=True)

    # Write-only fields for creation
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all(), write_only=True, required=False )
    fa_id = serializers.PrimaryKeyRelatedField(queryset=FirstAidList.objects.all(), write_only=True, required=False)
   

    class Meta:
        model = FirstAidTransactions
        fields = '__all__'