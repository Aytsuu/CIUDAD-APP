from rest_framework import serializers
from .models import *
from datetime import date  # Add this import

class MedicineListSerializers(serializers.ModelSerializer):
    class Meta:
        model = Medicinelist
        fields = '__all__'

class FirstAidListSerializers(serializers.ModelSerializer):
    class Meta:
        model = FirstAidList
        fields = '__all__'

class CommodityListSerializers(serializers.ModelSerializer):
    class Meta:
        model = CommodityList
        fields = '__all__'
         
         
 
class CategorySerializers(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields = '__all__'
    
class InventorySerializers(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'  # Include all fields

    def validate(self, data):
        """Custom validation for Inventory data"""
        print("Received data:", data)  # Debugging step

        # Ensure expiry_date is in the future
        if "expiry_date" in data and data["expiry_date"] <= date.today():
            raise serializers.ValidationError({"expiry_date": "Expiry date must be in the future."})

        # Ensure inv_type is not empty
        if not data.get("inv_type") or data["inv_type"].strip() == "":
            raise serializers.ValidationError({"inv_type": "Inventory type cannot be empty."})

        return data  # Return validated data


class MedicineInventorySerializer(serializers.ModelSerializer):
  # Show full details when retrieving
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    med_detail = MedicineListSerializers(source='med_id', read_only=True)  
    cat_detail = CategorySerializers(source='cat_id', read_only=True)

    # Allow setting foreign keys when adding records
    inv_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(), required=True
    )
    med_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicinelist.objects.all(), required=True
    )
    cat_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=True
    )


    class Meta:
        model = MedicineInventory
        fields = '__all__'  # Ensure all fields are included
    
    def validate(self, data):
        """Custom validation for bad responses"""
        
        # Ensure numeric fields are greater than zero
        if data.get("minv_qty") is None or data["minv_qty"] <= 0:
            raise serializers.ValidationError({"minv_qty": "Quantity must be greater than zero."})
        
        if data.get("minv_pcs") is None or data["minv_pcs"] < 0:
            raise serializers.ValidationError({"minv_pcs": "Pieces cannot be negative."})
        
        if data.get("minv_qty_avail") is None or data["minv_qty_avail"] < 0:
            raise serializers.ValidationError({"minv_qty_avail": "Available quantity cannot be negative."})
        
        # Ensure required foreign keys exist
        if not data.get("med_id"):
            raise serializers.ValidationError({"med_id": "Medicine ID is required."})
        
        if not data.get("inv_id"):
            raise serializers.ValidationError({"inv_id": "Inventory ID is required."})
        
        if not data.get("cat_id"):
            raise serializers.ValidationError({"cat_id": "Category ID is required."})
        
        # Ensure text fields are not empty
        for field in ["minv_dsg_unit", "minv_form", "minv_qty_unit"]:
            if not data.get(field) or data[field].strip() == "":
                raise serializers.ValidationError({field: f"{field.replace('_', ' ').title()} cannot be empty."})
        
        return data  # Return validated data

    def validate_med_id(self, value):
        if isinstance(value, list):
            raise serializers.ValidationError("Medicine ID must be a single value, not an array.")
        return value