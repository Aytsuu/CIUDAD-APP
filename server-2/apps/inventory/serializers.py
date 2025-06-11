from rest_framework import serializers
from .models import *
from datetime import date  # Add this import
from rest_framework import serializers



class PartialUpdateMixin:
    def to_internal_value(self, data):
        if self.instance:
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)


class MedicineListSerializers(serializers.ModelSerializer):
    catlist = serializers.CharField(source='cat.cat_name', read_only=True)  # Read-only field for category name
    class Meta: 
        model = Medicinelist
        fields = '__all__'
  
class FirstAidListSerializers(serializers.ModelSerializer):
    catlist = serializers.CharField(source='cat.cat_name', read_only=True)  # Read-only field for category name
    
    class Meta:
        model = FirstAidList
        fields = '__all__'

class CommodityListSerializers(serializers.ModelSerializer):
    catlist = serializers.CharField(source='cat.cat_name', read_only=True)  # Read-only field for category name

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
        fields = '__all__'  # Automatically includes all model fields

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


class MedicineInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    med_detail = MedicineListSerializers(source='med_id', read_only=True)  

    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    med_id = serializers.PrimaryKeyRelatedField(queryset=Medicinelist.objects.all())
    # cat_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())


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
        
        
        
class CommodityInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    com_detail = CommodityListSerializers(source='com_id', read_only=True)  
    # cat_detail = CategorySerializers(source='cat_id', read_only=True)
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    com_id = serializers.PrimaryKeyRelatedField(queryset=CommodityList.objects.all())
    # cat_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())

    class Meta:
        model = CommodityInventory
        fields = '__all__'
        

    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:
            # Partial update: Allow missing fields
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)

class CommodityTransactionSerializer(serializers.ModelSerializer):
    # Read-only fields for viewing related details
    inv_detail = InventorySerializers(source='inv_id', read_only=True)
    cinv_detail = CommodityInventorySerializer(source='cinv_id', read_only=True)
    com_detail = CommodityListSerializers(source='com_id', read_only=True)


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
        
    
class FirstAidInventorySerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    fa_detail = FirstAidListSerializers(source='fa_id', read_only=True)  
    # cat_detail = CategorySerializers(source='cat_id', read_only=True)
    
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    fa_id = serializers.PrimaryKeyRelatedField(queryset=FirstAidList.objects.all())
    # cat_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())


    class Meta:
        model = FirstAidInventory
        fields = '__all__'
        

    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:
            # Partial update: Allow missing fields
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
    
    
class FirstTransactionSerializer(serializers.ModelSerializer):
    # Read-only fields for viewing related details
    inv_detail = InventorySerializers(source='inv_id', read_only=True)
    finv_detail = FirstAidInventorySerializer(source='finv_id', read_only=True)
    fa_detail = FirstAidListSerializers(source='fa_id', read_only=True)
    # cat_detail = CategorySerializers(source='cat_id', read_only=True)
    fa_name = serializers.CharField(source='finv_id.fa_id.fa_name', read_only=True)

    # Write-only fields for creation
    inv_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all(), write_only=True, required=False
    )
    fa_id = serializers.PrimaryKeyRelatedField(
        queryset=FirstAidList.objects.all(), write_only=True, required=False
    )
    # cat_id = serializers.PrimaryKeyRelatedField(
    #     queryset=Category.objects.all(), write_only=True, required=False
    # )

    class Meta:
        model = FirstAidTransactions
        fields = '__all__'




# class VaccineCategorySerializer(serializers.ModelSerializer):
     
#     class Meta:
#         model = AntigenCategory
#         fields = '__all__'

class ImmunizationSuppliesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImmunizationSupplies
        fields = '__all__'
class VaccineIntervalSerializer(serializers.ModelSerializer):
     
    class Meta:
        model = VaccineInterval
        fields = '__all__'
class RoutineFrequencySerializer(serializers.ModelSerializer):
  
    class Meta:
        model = RoutineFrequency
        fields = '__all__'

class VacccinationListSerializer(serializers.ModelSerializer):
    
    # All intervals for this vaccine (using the related_name)
    intervals = VaccineIntervalSerializer(many=True, read_only=True)
    
    # Routine frequency for this vaccine (using the related_name)
    routine_frequency = RoutineFrequencySerializer(read_only=True)
    
    class Meta:
        model = VaccineList
        fields = '__all__'
        
class VaccineStockSerializer(serializers.ModelSerializer):
    vaccinelist = VacccinationListSerializer(source='vac_id', read_only = True)
    inv_details = InventorySerializers(source='inv_id', read_only=True)
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    vac_id = serializers.PrimaryKeyRelatedField(queryset=VaccineList.objects.all())

    class Meta:
        model = VaccineStock
        fields = '__all__'
        
        
    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:
            # Partial update: Allow missing fields
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
        

class AntigenTransactionSerializer(serializers.ModelSerializer):
    vaccine_detail = VaccineStockSerializer(source='vacStck_id', read_only=True)

    vacStck_id = serializers.PrimaryKeyRelatedField(queryset=VaccineStock.objects.all())
    class Meta:
        model = AntigenTransaction
        fields = '__all__' 
        
class ImmnunizationStockSuppliesSerializer(serializers.ModelSerializer):
    inv_details = InventorySerializers(source='inv_id', read_only=True)
    immunization_supplies = ImmunizationSuppliesSerializer(source='imz_id', read_only=True)
    
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    imz_id = serializers.PrimaryKeyRelatedField(queryset=ImmunizationSupplies.objects.all())
    class Meta:
        model = ImmunizationStock
        fields = '__all__'
        
    def to_internal_value(self, data):
        """Allow partial updates but require all fields for creation."""
        if self.instance:
            # Partial update: Allow missing fields
            for field in self.fields:
                if field not in data:
                    self.fields[field].required = False
        return super().to_internal_value(data)
        
        
class ImmunizationSuppliesTransactionSerializer(serializers.ModelSerializer):
    imzstock_detail = ImmnunizationStockSuppliesSerializer(source='imzStck_id', read_only=True)
    imzStck_id = serializers.PrimaryKeyRelatedField(queryset=ImmunizationStock.objects.all())

    class Meta:
        model = ImmunizationTransaction
        fields = '__all__'