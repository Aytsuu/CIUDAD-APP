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
    
    
class CommodityInventoryVIew(generics.ListCreateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset=CommodityInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
class FirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    
    
    
    
    
    
    
# ----------------------MEDICINE STOCK---UPDATE-----------------------------------  
class MedicineInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset = MedicineInventory.objects.all()
    lookup_field='minv_id'
    
    def get_object(self):
       minv_id = self.kwargs.get('minv_id')
       obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
       return obj
       
class CommodityInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset = CommodityInventory.objects.all()
    lookup_field='cinv_id'
    
    def get_object(self):
       cinv_id = self.kwargs.get('cinv_id')
       obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
       return obj


class FirstAidInvRetrieveView(generics.RetrieveUpdateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
    lookup_field='finv_id'
    
    def get_object(self):
       finv_id = self.kwargs.get('finv_id')
       obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
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
   
class DeleteCommodityInvView(generics.DestroyAPIView):
    serializer_class=CommodityInventorySerializer
    queryset = CommodityInventory.objects.all()
 
    def get_object(self):
       cinv_id = self.kwargs.get('cinv_id')
       obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
       return obj
    def perform_destroy(self, instance):
        # Get the related Inventory record
        inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
        # Delete the MedicineInventory instance
        instance.delete()
        # Delete the related Inventory record
        if inventory_record:
            inventory_record.delete()
            
class DeleteFirstAidInvView(generics.DestroyAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
 
    def get_object(self):
       finv_id = self.kwargs.get('finv_id')
       obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
       return obj
    def perform_destroy(self, instance):
        # Get the related Inventory record
        inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
        # Delete the MedicineInventory instance
        instance.delete()
        # Delete the related Inventory record
        if inventory_record:
            inventory_record.delete()


class DeleteFirstAidInvView(generics.DestroyAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset = FirstAidInventory.objects.all()
 
    def get_object(self):
       finv_id = self.kwargs.get('finv_id')
       obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
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
    
class CommodityTransactionView(generics.ListCreateAPIView):
    serializer_class=CommodityTransactionSerializer
    queryset=CommodityTransaction.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     
class FirstAidTransactionView(generics.ListCreateAPIView):
    serializer_class=FirstTransactionSerializer
    queryset=FirstAidTransactions.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     



class VaccineCategoryView(generics.ListCreateAPIView):
    serializer_class=VaccineCategorySerializer
    queryset=VaccineCategory.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class ImmunizationSuppliesView(generics.ListCreateAPIView):
    serializer_class=ImmunizationSuppliesSerializer
    queryset=ImmunizationSupplies.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class VaccineListView(generics.ListCreateAPIView):
    serializer_class=VacccinationListSerializer
    queryset=VaccineList.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class VaccineIntervalView(generics.ListCreateAPIView):
    serializer_class=VaccineIntervalSerializer
    queryset=VaccineInterval.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class RoutineFrequencyView(generics.ListCreateAPIView):
    serializer_class=RoutineFrequencySerializer
    queryset=RoutineFrequency.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
     
     
    
# Vaccine Category Views
class VaccineCategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineCategorySerializer
    queryset = VaccineCategory.objects.all()
    lookup_field = 'vaccat_id'
    
    def get_object(self):
        vaccat_id = self.kwargs.get('vaccat_id')
        obj = get_object_or_404(VaccineCategory, vaccat_id=vaccat_id)
        return obj

# Immunization Supplies Views
class ImmunizationSuppliesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    queryset = ImmunizationSupplies.objects.all()
    lookup_field = 'imz_id'
    
    def get_object(self):
        imz_id = self.kwargs.get('imz_id')
        obj = get_object_or_404(ImmunizationSupplies, imz_id=imz_id)
        return obj

# Vaccine List Views

class VaccineListRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()
    lookup_field = 'vac_id'
    
    def get_object(self):
        vac_id = self.kwargs.get('vac_id')
        return get_object_or_404(VaccineList, vac_id=vac_id)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_type = request.data.get('vac_type_choices')
        
        # If changing from routine to primary
        if instance.vac_type_choices == 'routine' and new_type == 'primary':
            RoutineFrequency.objects.filter(vac_id=instance).delete()
        
        # If changing from primary to routine
        elif instance.vac_type_choices == 'primary' and new_type == 'routine':
            VaccineInterval.objects.filter(vac_id=instance).delete()
        
        return super().update(request, *args, **kwargs)
# Vaccine Interval Views
class VaccineIntervalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineIntervalSerializer
    queryset = VaccineInterval.objects.all()
    lookup_field = 'vacInt_id'
    
    def get_object(self):
        vacInt_id = self.kwargs.get('vacInt_id')
        obj = get_object_or_404(VaccineInterval, vacInt_id=vacInt_id)
        return obj

# Routine Frequency Views
class RoutineFrequencyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RoutineFrequencySerializer
    queryset = RoutineFrequency.objects.all()
    lookup_field = 'routineF_id'
    
    def get_object(self):
        routineF_id = self.kwargs.get('routineF_id')
        obj = get_object_or_404(RoutineFrequency, routineF_id=routineF_id)
        return obj