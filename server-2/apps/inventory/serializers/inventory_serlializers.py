from ..models import*
from rest_framework import serializers
from datetime import date


class CategorySerializers(serializers.ModelSerializer):
    class Meta:
        model=Category
        fields = '__all__'
        
class InventorySerializers(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'  # Automatically includes all model fields
        read_only_fields = ['inv_id']  # <- ✅ this allows Django to auto-generate it

    def validate(self, data):
        """Custom validation for Inventory data"""
        print("Received data:", data)  # Debugging step

        # Validate expiry_date only if it's provided
        if "expiry_date" in data and data["expiry_date"] <= date.today():
            raise serializers.ValidationError({"expiry_date": "Expiry date must be in the future."})

        # Validate inv_type only if it's provided
        if "inv_type" in data and data["inv_type"].strip() == "":
            raise serializers.ValidationError({"inv_type": "Inventory type cannot be empty."})

        return data  # Return validated data

    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:  # If updating an existing instance
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False  # Make missing fields optional
        return super().to_internal_value(data)