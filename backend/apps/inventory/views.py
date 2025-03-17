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
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

# ----------------------CATEGORY---DELETE------------------------------------
class DeleteCategoryView(generics.DestroyAPIView):
    serializer_class = CategorySerializers    
    queryset = Category.objects.all()

    def get_object(self):
        cat_id = self.kwargs.get('cat_id')
        return get_object_or_404(Category, cat_id=cat_id)  # ✅ Correct field
    

# ----------------------INVENTORY---VIEW------------------------------------  
class InventoryView(generics.ListCreateAPIView):
    serializer_class=InventorySerializers
    queryset = Category.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

# ---------------------------LIST---VIEW------------------------------------

class MedicineListView(generics.ListCreateAPIView):
    serializer_class=MedicineListSerializers
    queryset= Medicinelist.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class CommodityListView(generics.ListCreateAPIView):
    serializer_class=CommodityListSerializers
    queryset=CommodityList
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class FirstAidListView(generics.ListCreateAPIView):
    serializer_class=FirstAidListSerializers
    queryset=FirstAidList
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# ---------------------------------------------------------------------
#STOCKS
class MedicineStocksView(generics.ListCreateAPIView):
    serializer_class=MedicineListSerializers
    queryset=MedicineStocks.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
    
