from rest_framework import serializers
from ..models import *
from ..serializers.inventory_serlializers import InventorySerializers
from apps.administration.serializers.staff_serializers import StaffFullSerializer



class AgegroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agegroup
        fields = '__all__'
        
class ImmunizationSuppliesSerializer(serializers.ModelSerializer):
    inv_detail = InventorySerializers(source='inv_id', read_only=True)

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
    intervals = VaccineIntervalSerializer(many=True, read_only=True)
    routine_frequency = RoutineFrequencySerializer(read_only=True)
    age_group = AgegroupSerializer(source='ageGroup', read_only=True)  # Read-only field for age group
    class Meta:
        model = VaccineList
        fields = '__all__'
        
class CondtionaleVaccineSerializer(serializers.ModelSerializer): 
    vac_detail = VacccinationListSerializer(source='vac_id', read_only=True)
    class Meta:
        model = ConditionalVaccine
        fields = '__all__'
        
class VaccineStockSerializer(serializers.ModelSerializer):
    vaccinelist = VacccinationListSerializer(source='vac_id', read_only = True)
    inv_details = InventorySerializers(source='inv_id', read_only=True)
    # Foreign keys (required for creation but optional for updates)
    inv_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    vac_id = serializers.PrimaryKeyRelatedField(queryset=VaccineList.objects.all())
    # age_group = AgegroupSerializer(source='ageGroup', read_only=True)  # Read-only field for age group

    class Meta:
        model = VaccineStock
        fields = '__all__'

        
class ImmnunizationStockSuppliesSerializer(serializers.ModelSerializer):
    imz_detail = ImmunizationSuppliesSerializer(source='imz_id', read_only=True)
    inv_detail = InventorySerializers(source='inv_id', read_only=True)  
    class Meta:
        model = ImmunizationStock
        fields = '__all__'
        
    
        


class AntigenTransactionSerializer(serializers.ModelSerializer):
    vac_stock = VaccineStockSerializer(source='vacStck_id', read_only=True)
    imz_stock = ImmnunizationStockSuppliesSerializer(source='imzStck_id', read_only=True)
    staff_detail = StaffFullSerializer(source='staff', read_only=True)
    class Meta:
        model = AntigenTransaction
        fields = '__all__' 