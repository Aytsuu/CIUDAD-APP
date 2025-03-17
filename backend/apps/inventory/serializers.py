from rest_framework import serializers
from .models import *

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
        model =Inventory
        fields = '__all__'
        

class MedicineStocksSerializers(serializers.ModelSerializer):
    class Meta:
        model=MedicineStocks
        fields = '__all__'