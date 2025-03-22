from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import * 
from datetime import datetime
 


# ----------------------CATEGORY---VIEW------------------------------------

class CategoryView(generics.ListCreateAPIView):
    serializer_class = CategorySerializers
    queryset  =Category.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

# ----------------------CATEGORY---DELETE------------------------------------
class DeleteCategoryView(generics.DestroyAPIView):
    serializer_class = CategorySerializers    
    queryset = Category.objects.all()

    def get_object(self):
        cat_id = self.kwargs.get('cat_id')
        return get_object_or_404(Category, cat_id=cat_id)  # ✅ Correct field
    

# ---------------------------LIST---VIEW------------------------------------
class MedicineListView(generics.ListCreateAPIView):
    serializer_class=MedicineListSerializers
    queryset= Medicinelist.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class CommodityListView(generics.ListCreateAPIView):
    serializer_class=CommodityListSerializers
    queryset=CommodityList.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class FirstAidListView(generics.ListCreateAPIView):
    serializer_class=FirstAidListSerializers
    queryset=FirstAidList.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
# -------------------DELETE-----LIST------------------
class DeleteMedicineListView(generics.DestroyAPIView):
    serializer_class = MedicineListSerializers    
    queryset = Medicinelist.objects.all()
    def get_object(self):
        med_id = self.kwargs.get('med_id')
        return get_object_or_404(Medicinelist, med_id=med_id) 
class DeleteFirstAidView(generics.DestroyAPIView):
    serializer_class = FirstAidListSerializers    
    queryset = FirstAidList.objects.all()
    def get_object(self):
        fa_id = self.kwargs.get('fa_id')
        return get_object_or_404(FirstAidList, fa_id=fa_id)  

class DeleteCommodityView(generics.DestroyAPIView):
    serializer_class = CommodityListSerializers    
    queryset = CommodityList.objects.all()
    def get_object(self):
        com_id = self.kwargs.get('com_id')
        return get_object_or_404(CommodityList, com_id=com_id) 
    


#--------------------UPDATE---LIST-----------------------
class MedicineListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=MedicineListSerializers
    queryset = Medicinelist.objects.all()
    lookup_field='med_id'
    
    def get_object(self):
       med_id = self.kwargs.get('med_id')
       obj = get_object_or_404(Medicinelist, med_id = med_id)
       return obj
       
class FirstAidListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidListSerializers
    queryset = FirstAidList.objects.all()
    lookup_field='fa_id'
    
    def get_object(self):
       fa_id = self.kwargs.get('fa_id')
       obj = get_object_or_404(FirstAidList, fa_id = fa_id)
       return obj
       
class CommodityListUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityListSerializers
    queryset = CommodityList.objects.all()
    lookup_field='com_id'
    
    def get_object(self):
       com_id = self.kwargs.get('com_id')
       obj = get_object_or_404(CommodityList, com_id = com_id)
       return obj
       
       


# ----------------------INVENTORY---VIEW------------------------------------  
class InventoryView(generics.ListCreateAPIView):
    serializer_class=InventorySerializers
    queryset = Inventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

class InventoryUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = InventorySerializers
    queryset = Inventory.objects.all()
    lookup_field='inv_id'
    
    def get_object(self):
       inv_id = self.kwargs.get('inv_id')
       obj = get_object_or_404(Inventory, inv_id = inv_id)
       return obj

    

# ---------------------------------------------------------------------
#STOCKS
class MedicineInventoryView(generics.ListCreateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset=MedicineInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
# ----------------------MEDICINE STOCK---RETRIEVE------------------------------------  
class MedicineInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset = MedicineInventory.objects.all()
    lookup_field='minv_id'
    
    def get_object(self):
       minv_id = self.kwargs.get('minv_id')
       obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
       return obj
       
    
# ----------------------MEDICINE STOCK---DELETE------------------------------------  
class DeleteMedicineInvView(generics.DestroyAPIView):
    serializer_class=MedicineInventorySerializer
    queryset = MedicineInventory.objects.all()
 
    def get_object(self):
       minv_id = self.kwargs.get('minv_id')
       obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
       return obj
    def perform_destroy(self, instance):
        # Get the related Inventory record
        inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey

        # Delete the MedicineInventory instance
        instance.delete()

        # Delete the related Inventory record
        if inventory_record:
            inventory_record.delete()
   
   

class MedicineTransactionView(generics.ListCreateAPIView):
    serializer_class=MedicineTransactionSerializers
    queryset=MedicineTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     