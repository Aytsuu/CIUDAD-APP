from django.shortcuts import render
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import * 
from datetime import datetime
from django.db.models import ProtectedError 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db.models import ProtectedError
from apps.pagination import StandardResultsPagination


# ----------------------CATEGORY---VIEW------------------------------------
class AgeGroupView(generics.ListCreateAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
    
class DeleteUpdateAgeGroupView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AgegroupSerializer
    queryset = Agegroup.objects.all()
    lookup_field = 'agegrp_id'
    def get_object(self):
        agegrp_id = self.kwargs.get('agegrp_id')
        return get_object_or_404(Agegroup, agegrp_id=agegrp_id)  # ✅ Correct field
class CategoryView(generics.ListCreateAPIView):
    serializer_class = CategorySerializers
    queryset  = Category.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete - this category has medicines assigned"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Category.DoesNotExist:
            return Response(
                {"detail": "Category not found"},
                status=status.HTTP_404_NOT_FOUND
            )
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
    lookup_field = 'med_id'  # 🔴 This tells DRF to look for `med_id` in the URL

    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class DeleteFirstAidView(generics.DestroyAPIView):
    serializer_class = FirstAidListSerializers    
    queryset = FirstAidList.objects.all()
    lookup_field = 'fa_id'
    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class DeleteCommodityView(generics.DestroyAPIView):
    serializer_class = CommodityListSerializers    
    queryset = CommodityList.objects.all()
    lookup_field = 'com_id'
    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
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
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
    
class CommodityInventoryVIew(generics.ListCreateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset=CommodityInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
    
    
    
class FirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
    
    
    
    
    
    
    
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
#DELETE THIS  
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
            
#DELETE THIS 
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
   
#DELETE THIS 
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



# DELETE THIS
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
     

class ImmunizationSuppliesView(generics.ListCreateAPIView):
    serializer_class=ImmunizationSuppliesSerializer
    queryset=ImmunizationSupplies.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

# views.py
class VaccineListView(generics.ListCreateAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()

    def create(self, request, *args, **kwargs):
        vac_name = request.data.get('vac_name')
        age_group_id = request.data.get('ageGroup')  # this must match the field name in your model

        # Check if vaccine already exists for that age group
        if VaccineList.objects.filter(vac_name__iexact=vac_name, ageGroup_id=age_group_id).exists():
            return Response(
                {"detail": "This vaccine alreasdsddy exists for the selected age group."},
                status=status.HTTP_400_BAD_REQUEST
            )

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
# class VaccineCategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VaccineCategorySerializer
#     queryset = AntigenCategory.objects.all()
#     lookup_field = 'vaccat_id'
    
#     def get_object(self):
#         vaccat_id = self.kwargs.get('vaccat_id')
#         obj = get_object_or_404(AntigenCategory, vaccat_id=vaccat_id)
#         return obj


# Immunization Supplies Views
class ImmunizationSuppliesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmunizationSuppliesSerializer
    queryset = ImmunizationSupplies.objects.all()
    lookup_field = 'imz_id'
    
    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("Cannot delete medicine. It is still in use by other records.")
        
        
# Vaccine List Views
class VaccineListRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VacccinationListSerializer
    queryset = VaccineList.objects.all()
    lookup_field = 'vac_id'
    def destroy(self, request, *args, **kwargs):
        """Override destroy method to handle ProtectedError properly"""
        try:
            instance = self.get_object()
            print(f"Attempting to delete instance: {instance}")
            instance.delete()
            print("Delete succeeded")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError as e:
            print(f"ProtectedError caught: {e}")
            return Response(
                {"error": "Cannot delete. It is still in use by other records."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class ConditionalVaccineListView(generics.ListCreateAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
class ConditionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CondtionaleVaccineSerializer
    queryset = ConditionalVaccine.objects.all()
    lookup_field = 'vac_id'
    def get_object(self):
        vac_id = self.kwargs.get('vac_id')
        obj = get_object_or_404(ConditionalVaccine, vac_id=vac_id)
        return obj
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
    

 
class VaccineStocksView(generics.ListCreateAPIView):
    serializer_class=VaccineStockSerializer
    queryset=VaccineStock.objects.all()
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset 
    
class VaccineStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VaccineStockSerializer
    queryset = VaccineStock.objects.all()
    lookup_field = 'vacStck_id'
    def get_object(self):
        vacStck_id = self.kwargs.get('vacStck_id')
        obj = get_object_or_404(VaccineStock, vacStck_id=vacStck_id)
        return obj
    
# class VaccineStockVacRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VaccineStockSerializer
#     queryset = VaccineStock.objects.all()
#     lookup_field = 'vac_id'
#     def get_object(self):
#         vac_id = self.kwargs.get('vac_id')
#         obj = get_object_or_404(VaccineStock, vac_id=vac_id)
#         return obj
    
    
    
class ImmunizationStockSuppliesView(generics.ListCreateAPIView):
    serializer_class=ImmnunizationStockSuppliesSerializer
    queryset=ImmunizationStock.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    def get_queryset(self):
        queryset = ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
        return queryset
    
class AntigenTransactionView(generics.ListCreateAPIView):
    serializer_class = AntigenTransactionSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        return AntigenTransaction.objects.all().order_by('-created_at')  # or any logic

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    
class ImmunizationTransactionView(generics.ListCreateAPIView):
    serializer_class=ImmunizationSuppliesTransactionSerializer
    # queryset=ImmunizationTransaction.objects.all() 
    pagination_class = StandardResultsPagination
    
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


# Immunization Supplies Views
class ImmunizationSuppliesStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ImmnunizationStockSuppliesSerializer
    queryset = ImmunizationStock.objects.all()
    lookup_field = 'imzStck_id'
    
    def get_object(self):
        imzStck_id = self.kwargs.get('imzStck_id')
        obj = get_object_or_404(ImmunizationStock, imzStck_id=imzStck_id)
        return obj
    

# Immunization Supplies Views
class ArchiveImmunizationSuppliesStockListView(generics.ListAPIView):
    serializer_class = ImmnunizationStockSuppliesSerializer
    queryset = ImmunizationStock.objects.all()
    
    def get_queryset(self):
        # Filter to only include records where inv_id__is_Archived is True
        return ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)

class ArchiveVaccineStocksView(generics.ListAPIView):
    serializer_class=VaccineStockSerializer
    queryset=VaccineStock.objects.all()
   
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset 


class ArchiveMedicineInventoryView(generics.ListCreateAPIView):
    serializer_class=MedicineInventorySerializer
    queryset=MedicineInventory.objects.all()
  
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
    
class ArhiveCommodityInventoryVIew(generics.ListCreateAPIView):
    serializer_class=CommodityInventorySerializer
    queryset=CommodityInventory.objects.all()
    
    def get_queryset(self):
        queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
class ArchiveFirstAidInventoryVIew(generics.ListCreateAPIView):
    serializer_class=FirstAidInventorySerializer
    queryset=FirstAidInventory.objects.all()
   
    def get_queryset(self):
        # Filter out MedicineInventory entries where the related Inventory is archived
        queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
        return queryset
    
    
    