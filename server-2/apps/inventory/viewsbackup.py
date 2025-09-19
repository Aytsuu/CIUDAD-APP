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
from django.db.models import Q, Sum, Count, Case, When, Min
from django.db.models.functions import TruncMonth
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from pagination import StandardResultsPagination
import re
from calendar import monthrange


# ----------------------CATEGORY---VIEW------------------------------------
# class AgeGroupView(generics.ListCreateAPIView):
#     serializer_class = AgegroupSerializer
#     queryset = Agegroup.objects.all()
    
# class DeleteUpdateAgeGroupView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = AgegroupSerializer
#     queryset = Agegroup.objects.all()
#     lookup_field = 'agegrp_id'
#     def get_object(self):
#         agegrp_id = self.kwargs.get('agegrp_id')
#         return get_object_or_404(Agegroup, agegrp_id=agegrp_id)
    
    
# class CategoryView(generics.ListCreateAPIView):
#     serializer_class = CategorySerializers
#     queryset  = Category.objects.all()
    
#     def create(self , request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
#     def delete(self, request, pk):
#         try:
#             category = Category.objects.get(pk=pk)
#             category.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except ProtectedError:
#             return Response(
#                 {"detail": "Cannot delete - this category has medicines assigned"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Category.DoesNotExist:
#             return Response(
#                 {"detail": "Category not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )


# ----------------------CATEGORY---DELETE------------------------------------
# class DeleteCategoryView(generics.DestroyAPIView):
#     serializer_class = CategorySerializers    
#     queryset = Category.objects.all()

#     def get_object(self):
#         cat_id = self.kwargs.get('cat_id')
#         return get_object_or_404(Category, cat_id=cat_id)  # ✅ Correct field
    

# ---------------------------LIST---VIEW------------------------------------
# class MedicineListView(generics.ListCreateAPIView):
#     serializer_class=MedicineListSerializers
#     queryset= Medicinelist.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

# class CommodityListView(generics.ListCreateAPIView):
#     serializer_class=CommodityListSerializers
#     queryset=CommodityList.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

# class FirstAidListView(generics.ListCreateAPIView):
#     serializer_class=FirstAidListSerializers
#     queryset=FirstAidList.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
    
# -------------------DELETE-----LIST------------------
# class DeleteMedicineListView(generics.DestroyAPIView):
#     serializer_class = MedicineListSerializers
#     queryset = Medicinelist.objects.all()
#     lookup_field = 'med_id'  # 🔴 This tells DRF to look for `med_id` in the URL

#     def destroy(self, request, *args, **kwargs):
#         """Override destroy method to handle ProtectedError properly"""
#         try:
#             instance = self.get_object()
#             print(f"Attempting to delete instance: {instance}")
#             instance.delete()
#             print("Delete succeeded")
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except ProtectedError as e:
#             print(f"ProtectedError caught: {e}")
#             return Response(
#                 {"error": "Cannot delete. It is still in use by other records."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
# class DeleteFirstAidView(generics.DestroyAPIView):
#     serializer_class = FirstAidListSerializers    
#     queryset = FirstAidList.objects.all()
#     lookup_field = 'fa_id'
#     def destroy(self, request, *args, **kwargs):
#         """Override destroy method to handle ProtectedError properly"""
#         try:
#             instance = self.get_object()
#             print(f"Attempting to delete instance: {instance}")
#             instance.delete()
#             print("Delete succeeded")
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except ProtectedError as e:
#             print(f"ProtectedError caught: {e}")
#             return Response(
#                 {"error": "Cannot delete. It is still in use by other records."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
# class DeleteCommodityView(generics.DestroyAPIView):
#     serializer_class = CommodityListSerializers    
#     queryset = CommodityList.objects.all()
#     lookup_field = 'com_id'
#     def destroy(self, request, *args, **kwargs):
#         """Override destroy method to handle ProtectedError properly"""
#         try:
#             instance = self.get_object()
#             print(f"Attempting to delete instance: {instance}")
#             instance.delete()
#             print("Delete succeeded")
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except ProtectedError as e:
#             print(f"ProtectedError caught: {e}")
#             return Response(
#                 {"error": "Cannot delete. It is still in use by other records."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#     #--------------------UPDATE---LIST-----------------------
# class MedicineListUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class=MedicineListSerializers
#     queryset = Medicinelist.objects.all()
#     lookup_field='med_id'
    
#     def get_object(self):
#        med_id = self.kwargs.get('med_id')
#        obj = get_object_or_404(Medicinelist, med_id = med_id)
#        return obj
       
# class FirstAidListUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class=FirstAidListSerializers
#     queryset = FirstAidList.objects.all()
#     lookup_field='fa_id'
    
#     def get_object(self):
#        fa_id = self.kwargs.get('fa_id')
#        obj = get_object_or_404(FirstAidList, fa_id = fa_id)
#        return obj
       
# class CommodityListUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class=CommodityListSerializers
#     queryset = CommodityList.objects.all()
#     lookup_field='com_id'
    
#     def get_object(self):
#        com_id = self.kwargs.get('com_id')
#        obj = get_object_or_404(CommodityList, com_id = com_id)
#        return obj
                 
# ----------------------INVENTORY---VIEW------------------------------------  
# class InventoryView(generics.ListCreateAPIView):
#     serializer_class=InventorySerializers
#     queryset = Inventory.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    

# class InventoryUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class = InventorySerializers
#     queryset = Inventory.objects.all()
#     lookup_field='inv_id'
    
#     def get_object(self):
#        inv_id = self.kwargs.get('inv_id')
#        obj = get_object_or_404(Inventory, inv_id = inv_id)
#        return obj

     

# ---------------------------------------------------------------------
#STOCKS
# class MedicineInventoryView(generics.ListCreateAPIView):
#     serializer_class=MedicineInventorySerializer
#     queryset=MedicineInventory.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
#         return queryset
    
    
# class CommodityInventoryVIew(generics.ListCreateAPIView):
#     serializer_class=CommodityInventorySerializer
#     queryset=CommodityInventory.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
#     def get_queryset(self):
#         queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
#         return queryset
    
    
    
    
# class FirstAidInventoryVIew(generics.ListCreateAPIView):
#     serializer_class=FirstAidInventorySerializer
#     queryset=FirstAidInventory.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
#         return queryset
    
    
    
    
    
    
    
    
# ----------------------MEDICINE STOCK---UPDATE-----------------------------------  
# class MedicineInvRetrieveView(generics.RetrieveUpdateAPIView):
#     serializer_class=MedicineInventorySerializer
#     queryset = MedicineInventory.objects.all()
#     lookup_field='minv_id'
    
#     def get_object(self):
#        minv_id = self.kwargs.get('minv_id')
#        obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
#        return obj
       
# class CommodityInvRetrieveView(generics.RetrieveUpdateAPIView):
#     serializer_class=CommodityInventorySerializer
#     queryset = CommodityInventory.objects.all()
#     lookup_field='cinv_id'
    
#     def get_object(self):
#        cinv_id = self.kwargs.get('cinv_id')
#        obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
#        return obj



# class FirstAidInvRetrieveView(generics.RetrieveUpdateAPIView):
#     serializer_class=FirstAidInventorySerializer
#     queryset = FirstAidInventory.objects.all()
#     lookup_field='finv_id'
    
#     def get_object(self):
#        finv_id = self.kwargs.get('finv_id')
#        obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
#        return obj
    
# ----------------------MEDICINE STOCK---DELETE------------------------------------ 
#DELETE THIS  
# class DeleteMedicineInvView(generics.DestroyAPIView):
#     serializer_class=MedicineInventorySerializer
#     queryset = MedicineInventory.objects.all()
 
#     def get_object(self):
#        minv_id = self.kwargs.get('minv_id')
#        obj = get_object_or_404(MedicineInventory, minv_id = minv_id)
#        return obj
#     def perform_destroy(self, instance):
#         # Get the related Inventory record
#         inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
#         # Delete the MedicineInventory instance
#         instance.delete()
#         # Delete the related Inventory record
#         if inventory_record:
#             inventory_record.delete()
            
#DELETE THIS 
# class DeleteCommodityInvView(generics.DestroyAPIView):
#     serializer_class=CommodityInventorySerializer
#     queryset = CommodityInventory.objects.all()
 
#     def get_object(self):
#        cinv_id = self.kwargs.get('cinv_id')
#        obj = get_object_or_404(CommodityInventory, cinv_id = cinv_id)
#        return obj
#     def perform_destroy(self, instance):
#         # Get the related Inventory record
#         inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
#         # Delete the MedicineInventory instance
#         instance.delete()
#         # Delete the related Inventory record
#         if inventory_record:
#             inventory_record.delete()
   
# #DELETE THIS 
# class DeleteFirstAidInvView(generics.DestroyAPIView):
#     serializer_class=FirstAidInventorySerializer
#     queryset = FirstAidInventory.objects.all()
 
#     def get_object(self):
#        finv_id = self.kwargs.get('finv_id')
#        obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
#        return obj
#     def perform_destroy(self, instance):
#         # Get the related Inventory record
#         inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
#         # Delete the MedicineInventory instance
#         instance.delete()
#         # Delete the related Inventory record
#         if inventory_record:
#             inventory_record.delete()



# DELETE THIS
# class DeleteFirstAidInvView(generics.DestroyAPIView):
#     serializer_class=FirstAidInventorySerializer
#     queryset = FirstAidInventory.objects.all()
 
#     def get_object(self):
#        finv_id = self.kwargs.get('finv_id')
#        obj = get_object_or_404(FirstAidInventory, finv_id = finv_id)
#        return obj
#     def perform_destroy(self, instance):
#         # Get the related Inventory record
#         inventory_record = instance.inv_id  # Access the related Inventory instance via ForeignKey
#         # Delete the MedicineInventory instance
#         instance.delete()
#         # Delete the related Inventory record
#         if inventory_record:
#             inventory_record.delete()
    
    

# class MedicineTransactionView(generics.ListCreateAPIView):
#     serializer_class=MedicineTransactionSerializers
#     queryset=MedicineTransactions.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
    
# class CommodityTransactionView(generics.ListCreateAPIView):
#     serializer_class=CommodityTransactionSerializer
#     queryset=CommodityTransaction.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
     
# class FirstAidTransactionView(generics.ListCreateAPIView):
#     serializer_class=FirstTransactionSerializer
#     queryset=FirstAidTransactions.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
     



# class ImmunizationSuppliesView(generics.ListCreateAPIView):
#     serializer_class=ImmunizationSuppliesSerializer
#     queryset=ImmunizationSupplies.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

# # views.py
# class VaccineListView(generics.ListCreateAPIView):
#     serializer_class = VacccinationListSerializer
#     queryset = VaccineList.objects.all()

#     def create(self, request, *args, **kwargs):
#         vac_name = request.data.get('vac_name')
#         age_group_id = request.data.get('ageGroup')  # this must match the field name in your model

#         # Check if vaccine already exists for that age group
#         if VaccineList.objects.filter(vac_name__iexact=vac_name, ageGroup_id=age_group_id).exists():
#             return Response(
#                 {"detail": "This vaccine alreasdsddy exists for the selected age group."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         return super().create(request, *args, **kwargs)

# class VaccineIntervalView(generics.ListCreateAPIView):
#     serializer_class=VaccineIntervalSerializer
#     queryset=VaccineInterval.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

# class RoutineFrequencyView(generics.ListCreateAPIView):
#     serializer_class=RoutineFrequencySerializer
#     queryset=RoutineFrequency.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
     
     
    
# # Vaccine Category Views
# # class VaccineCategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
# #     serializer_class = VaccineCategorySerializer
# #     queryset = AntigenCategory.objects.all()
# #     lookup_field = 'vaccat_id'
    
# #     def get_object(self):
# #         vaccat_id = self.kwargs.get('vaccat_id')
# #         obj = get_object_or_404(AntigenCategory, vaccat_id=vaccat_id)
# #         return obj


# # Immunization Supplies Views
# class ImmunizationSuppliesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = ImmunizationSuppliesSerializer
#     queryset = ImmunizationSupplies.objects.all()
#     lookup_field = 'imz_id'
    
#     def perform_destroy(self, instance):
#         try:
#             instance.delete()
#         except ProtectedError:
#             raise ValidationError("Cannot delete medicine. It is still in use by other records.")
        
        
# # Vaccine List Views
# class VaccineListRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VacccinationListSerializer
#     queryset = VaccineList.objects.all()
#     lookup_field = 'vac_id'
#     def destroy(self, request, *args, **kwargs):
#         """Override destroy method to handle ProtectedError properly"""
#         try:
#             instance = self.get_object()
#             print(f"Attempting to delete instance: {instance}")
#             instance.delete()
#             print("Delete succeeded")
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except ProtectedError as e:
#             print(f"ProtectedError caught: {e}")
#             return Response(
#                 {"error": "Cannot delete. It is still in use by other records."},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
# class ConditionalVaccineListView(generics.ListCreateAPIView):
#     serializer_class = CondtionaleVaccineSerializer
#     queryset = ConditionalVaccine.objects.all()
# class ConditionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = CondtionaleVaccineSerializer
#     queryset = ConditionalVaccine.objects.all()
#     lookup_field = 'vac_id'
#     def get_object(self):
#         vac_id = self.kwargs.get('vac_id')
#         obj = get_object_or_404(ConditionalVaccine, vac_id=vac_id)
#         return obj
# # Vaccine Interval Views
# class VaccineIntervalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VaccineIntervalSerializer
#     queryset = VaccineInterval.objects.all()
#     lookup_field = 'vacInt_id'
    
#     def get_object(self):
#         vacInt_id = self.kwargs.get('vacInt_id')
#         obj = get_object_or_404(VaccineInterval, vacInt_id=vacInt_id)
#         return obj

# # Routine Frequency Views
# class RoutineFrequencyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = RoutineFrequencySerializer
#     queryset = RoutineFrequency.objects.all()
#     lookup_field = 'routineF_id'
    
#     def get_object(self):
#         routineF_id = self.kwargs.get('routineF_id')
#         obj = get_object_or_404(RoutineFrequency, routineF_id=routineF_id)
#         return obj
    

 
# class VaccineStocksView(generics.ListCreateAPIView):
#     serializer_class=VaccineStockSerializer
#     queryset=VaccineStock.objects.all()
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
#         return queryset 
    
# class VaccineStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = VaccineStockSerializer
#     queryset = VaccineStock.objects.all()
#     lookup_field = 'vacStck_id'
#     def get_object(self):
#         vacStck_id = self.kwargs.get('vacStck_id')
#         obj = get_object_or_404(VaccineStock, vacStck_id=vacStck_id)
#         return obj
    
# # class VaccineStockVacRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
# #     serializer_class = VaccineStockSerializer
# #     queryset = VaccineStock.objects.all()
# #     lookup_field = 'vac_id'
# #     def get_object(self):
# #         vac_id = self.kwargs.get('vac_id')
# #         obj = get_object_or_404(VaccineStock, vac_id=vac_id)
# #         return obj
    
    
    
# class ImmunizationStockSuppliesView(generics.ListCreateAPIView):
#     serializer_class=ImmnunizationStockSuppliesSerializer
#     queryset=ImmunizationStock.objects.all()
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)
#     def get_queryset(self):
#         queryset = ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=False)
#         return queryset
    
# class AntigenTransactionView(generics.ListCreateAPIView):
#     serializer_class = AntigenTransactionSerializer
#     pagination_class = StandardResultsPagination

#     def get_queryset(self):
#         return AntigenTransaction.objects.all().order_by('-created_at')  # or any logic

#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)

    
# class ImmunizationTransactionView(generics.ListCreateAPIView):
#     serializer_class=ImmunizationSuppliesTransactionSerializer
#     # queryset=ImmunizationTransaction.objects.all() 
#     pagination_class = StandardResultsPagination
    
#     def create(self, request, *args, **kwargs):
#         return super().create(request, *args, **kwargs)


# # Immunization Supplies Views
# class ImmunizationSuppliesStockRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class = ImmnunizationStockSuppliesSerializer
#     queryset = ImmunizationStock.objects.all()
#     lookup_field = 'imzStck_id'
    
#     def get_object(self):
#         imzStck_id = self.kwargs.get('imzStck_id')
#         obj = get_object_or_404(ImmunizationStock, imzStck_id=imzStck_id)
#         return obj
    

# # Immunization Supplies Views
# class ArchiveImmunizationSuppliesStockListView(generics.ListAPIView):
#     serializer_class = ImmnunizationStockSuppliesSerializer
#     queryset = ImmunizationStock.objects.all()
    
#     def get_queryset(self):
#         # Filter to only include records where inv_id__is_Archived is True
#         return ImmunizationStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)

# class ArchiveVaccineStocksView(generics.ListAPIView):
#     serializer_class=VaccineStockSerializer
#     queryset=VaccineStock.objects.all()
   
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = VaccineStock.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
#         return queryset 


# class ArchiveMedicineInventoryView(generics.ListCreateAPIView):
#     serializer_class=MedicineInventorySerializer
#     queryset=MedicineInventory.objects.all()
  
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = MedicineInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
#         return queryset
    
    
# class ArhiveCommodityInventoryVIew(generics.ListCreateAPIView):
#     serializer_class=CommodityInventorySerializer
#     queryset=CommodityInventory.objects.all()
    
#     def get_queryset(self):
#         queryset = CommodityInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
#         return queryset
    
# class ArchiveFirstAidInventoryVIew(generics.ListCreateAPIView):
#     serializer_class=FirstAidInventorySerializer
#     queryset=FirstAidInventory.objects.all()
   
#     def get_queryset(self):
#         # Filter out MedicineInventory entries where the related Inventory is archived
#         queryset = FirstAidInventory.objects.select_related('inv_id').filter(inv_id__is_Archived=True)
#         return queryset
    





#     # ==================MEDICINE REPORT=======================

# class MedicineSummaryMonthsAPIView(APIView):
#     pagination_class = StandardResultsPagination

#     def get(self, request):
#         try:
#             queryset = MedicineTransactions.objects.all()

#             search_query = request.GET.get('search', '').strip().lower()
#             year_param = request.GET.get('year', 'all')

#             if year_param and year_param != 'all':
#                 try:
#                     if '-' in year_param:
#                         year, month = map(int, year_param.split('-'))
#                         queryset = queryset.filter(
#                             created_at__year=year,
#                             created_at__month=month
#                         )
#                     else:
#                         year = int(year_param)
#                         queryset = queryset.filter(created_at__year=year)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid year format. Use YYYY or YYYY-MM.'
#                     }, status=status.HTTP_400_BAD_REQUEST)

#             # Get distinct months in queryset, sorted descending
#             distinct_months = queryset.annotate(
#                 month=TruncMonth('created_at')
#             ).values('month').distinct().order_by('-month')

#             formatted_months = []

#             for item in distinct_months:
#                 month_date = item['month']
#                 if not month_date:
#                     continue
#                 month_str = month_date.strftime('%Y-%m')
#                 month_name = month_date.strftime('%B %Y')

#                 if search_query and search_query not in month_name.lower():
#                     continue

#                 # Get the date range for this month
#                 start_date = month_date.date()
#                 from calendar import monthrange
#                 last_day = monthrange(start_date.year, start_date.month)[1]
#                 end_date = start_date.replace(day=last_day)

#                 # Filter transactions for this month
#                 month_transactions = queryset.filter(
#                     created_at__date__gte=start_date,
#                     created_at__date__lte=end_date
#                 )

#                 # Count distinct medicine+inventory combos
#                 total_items = month_transactions.values(
#                     "minv_id__med_id",
#                     "minv_id__inv_id"
#                 ).distinct().count()

#                 formatted_months.append({
#                     'month': month_str,
#                     'month_name': month_name,
#                     'total_items': total_items,
#                 })

#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(formatted_months, request)
#             if page is not None:
#                 return paginator.get_paginated_response({
#                     'success': True,
#                     'data': page,
#                     'total_months': len(formatted_months),
#                 })

#             return Response({
#                 'success': True,
#                 'data': formatted_months,
#                 'total_months': len(formatted_months),
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e),
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
# class MonthlyMedicineRecordsDetailAPIView(generics.ListAPIView):
#     serializer_class = MedicineInventorySerializer
#     pagination_class = StandardResultsPagination

#     def list(self, request, *args, **kwargs):
#         month_str = self.kwargs['month']  # Format: YYYY-MM
#         try:
#             year, month = map(int, month_str.split('-'))
#         except ValueError:
#             return Response({"error": "Invalid month format"}, status=400)

#         start_date = datetime(year, month, 1).date()
#         end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)

#         inventory_summary = []

#         # Identify unique medicine + inv_id (inventory) combinations from transactions up to end_date
#         med_inv_pairs = MedicineTransactions.objects.filter(
#             created_at__date__lte=end_date
#         ).values_list(
#             "minv_id__med_id",
#             "minv_id__inv_id"
#         ).distinct()

#         for med_id, inv_id in med_inv_pairs:
#             transactions = MedicineTransactions.objects.filter(
#                 minv_id__med_id=med_id,
#                 minv_id__inv_id=inv_id
#             ).order_by("created_at")

#             first_tx = transactions.select_related("minv_id__med_id", "minv_id__inv_id").first()
#             if not first_tx:
#                 continue

#             unit = first_tx.minv_id.minv_qty_unit
#             pcs_per_box = first_tx.minv_id.minv_pcs if unit and unit.lower() == "boxes" else 1

#             # Opening stock before start_date
#             opening_in = transactions.filter(
#                 created_at__date__lt=start_date,
#                 mdt_action__icontains="added"
#             )
#             opening_out = transactions.filter(
#                 created_at__date__lt=start_date,
#                 mdt_action__icontains="deduct"
#             )
#             opening_qty = (sum(self._parse_qty(t) for t in opening_in) -
#                            sum(self._parse_qty(t) for t in opening_out))

#             if unit and unit.lower() == "boxes":
#                 opening_qty *= pcs_per_box

#             # Received during the month
#             received_qty = sum(
#                 self._parse_qty(t) for t in transactions.filter(
#                     created_at__date__gte=start_date,
#                     created_at__date__lte=end_date,
#                     mdt_action__icontains="added"
#                 )
#             )
#             if unit and unit.lower() == "boxes":
#                 received_qty *= pcs_per_box

#             # Dispensed during the month
#             dispensed_qty = sum(
#                 self._parse_qty(t) for t in transactions.filter(
#                     created_at__date__gte=start_date,
#                     created_at__date__lte=end_date,
#                     mdt_action__icontains="deduct"
#                 )
#             )

#             # Opening displayed includes received
#             display_opening = opening_qty + received_qty
#             closing_qty = display_opening - dispensed_qty

#             inventory_summary.append({
#                 'med_name': f"{first_tx.minv_id.med_id.med_name} {first_tx.minv_id.minv_dsg}{first_tx.minv_id.minv_dsg_unit} {first_tx.minv_id.minv_form}",
#                 'opening': display_opening,
#                 'received': received_qty,
#                 'dispensed': dispensed_qty,
#                 'closing': closing_qty,
#                 'unit': "pcs",
#                 'expiry': first_tx.minv_id.inv_id.expiry_date
#             })

#         # Remove duplicates by med_name, keep first occurrence (same as before)
#         unique_summary = []
#         seen_meds = set()
#         for item in inventory_summary:
#             if item['med_name'] not in seen_meds:
#                 unique_summary.append(item)
#                 seen_meds.add(item['med_name'])

#         return Response({
#             'success': True,
#             'data': {
#                 'month': month_str,
#                 'inventory_summary': unique_summary,
#                 'total_items': len(unique_summary)
#             }
#         })

#     def _parse_qty(self, transaction):
#         """Extract numeric value from mdt_qty."""
#         match = re.search(r'\d+', str(transaction.mdt_qty))
#         return int(match.group()) if match else 0



# # ============================ COMMODITY REPORT =====================

# class CommoditySummaryMonthsAPIView(APIView):
#     pagination_class = StandardResultsPagination

#     def get(self, request):
#         try:
#             queryset = CommodityTransaction.objects.all()

#             search_query = request.GET.get('search', '').strip().lower()
#             year_param = request.GET.get('year', 'all')

#             if year_param and year_param != 'all':
#                 try:
#                     if '-' in year_param:
#                         year, month = map(int, year_param.split('-'))
#                         queryset = queryset.filter(
#                             created_at__year=year,
#                             created_at__month=month
#                         )
#                     else:
#                         year = int(year_param)
#                         queryset = queryset.filter(created_at__year=year)
#                 except ValueError:
#                     return Response({
#                         'success': False,
#                         'error': 'Invalid year format. Use YYYY or YYYY-MM.'
#                     }, status=400)

#             # Get distinct months only
#             distinct_months = queryset.annotate(
#                 month=TruncMonth('created_at')
#             ).values('month').distinct().order_by('-month')

#             formatted_months = []
#             for item in distinct_months:
#                 month_date = item['month']
#                 if not month_date:
#                     continue
#                 month_str = month_date.strftime('%Y-%m')
#                 month_name = month_date.strftime('%B %Y')

#                 if search_query and search_query not in month_name.lower():
#                     continue

#                 start_date = month_date.date()
#                 last_day = monthrange(start_date.year, start_date.month)[1]
#                 end_date = start_date.replace(day=last_day)

#                 # Transactions within month
#                 month_transactions = queryset.filter(
#                     created_at__date__gte=start_date,
#                     created_at__date__lte=end_date
#                 )

#                 # Count distinct commodity+inventory combos for this month
#                 total_items = month_transactions.values(
#                     "cinv_id__com_id",
#                     "cinv_id__inv_id"
#                 ).distinct().count()

#                 formatted_months.append({
#                     'month': month_str,
#                     'month_name': month_name,
#                     'total_items': total_items,
#                 })

#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(formatted_months, request)
#             if page is not None:
#                 return paginator.get_paginated_response({
#                     'success': True,
#                     'data': page,
#                     'total_months': len(formatted_months),
#                 })

#             return Response({
#                 'success': True,
#                 'data': formatted_months,
#                 'total_months': len(formatted_months),
#             }, status=200)

#         except Exception as e:
#             return Response({
#                 'success': False,
#                 'error': str(e)
#             }, status=500)



# class MonthlyCommodityRecordsDetailAPIView(generics.ListAPIView):
#     serializer_class = CommodityInventorySerializer
#     pagination_class = StandardResultsPagination

#     def list(self, request, *args, **kwargs):
#         month_str = self.kwargs.get('month')  # e.g. '2025-08'
#         try:
#             year, month = map(int, month_str.split('-'))
#         except (ValueError, AttributeError):
#             return Response({"error": "Invalid month format"}, status=400)

#         # Use date only for filtering to avoid timezone warnings
#         start_of_month = date(year, month, 1)
#         last_day = monthrange(year, month)[1]
#         end_of_month = date(year, month, last_day)

#         inventory_summary = []

#         # Unique commodity + expiry_date combos within or before month end
#         com_expiry_pairs = CommodityTransaction.objects.filter(
#             created_at__date__lte=end_of_month
#         ).values_list(
#             "cinv_id__com_id",
#             "cinv_id__inv_id__expiry_date"
#         ).distinct()

#         for com_id, expiry_date in com_expiry_pairs:
#             transactions = CommodityTransaction.objects.filter(
#                 cinv_id__com_id=com_id,
#                 cinv_id__inv_id__expiry_date=expiry_date
#             ).order_by('created_at')

#             first_tx = transactions.select_related("cinv_id__com_id", "cinv_id__inv_id").first()
#             if not first_tx:
#                 continue

#             unit = first_tx.cinv_id.cinv_qty_unit
#             pcs_per_box = first_tx.cinv_id.cinv_pcs if unit and unit.lower() == "boxes" else 1

#             # Opening stock before month start (added minus deducted)
#             opening_in = transactions.filter(
#                 created_at__date__lt=start_of_month,
#                 comt_action__icontains="added"
#             )
#             opening_out = transactions.filter(
#                 created_at__date__lt=start_of_month,
#                 comt_action__icontains="deduct"
#             )
#             opening_qty = sum(self._parse_qty(t) for t in opening_in) - sum(self._parse_qty(t) for t in opening_out)

#             # No extra multiplication here (boxes are counted as pcs per transaction)

#             # Received during the month
#             received_qty = sum(self._parse_qty(t) for t in transactions.filter(
#                 created_at__date__gte=start_of_month,
#                 created_at__date__lte=end_of_month,
#                 comt_action__icontains="added"
#             ))

#             # Dispensed during the month
#             dispensed_qty = sum(self._parse_qty(t) for t in transactions.filter(
#                 created_at__date__gte=start_of_month,
#                 created_at__date__lte=end_of_month,
#                 comt_action__icontains="deduct"
#             ))

#             # Opening displayed includes received during the month
#             display_opening = opening_qty + received_qty
#             closing_qty = display_opening - dispensed_qty

#             # Display unit as "pcs" if boxes
#             display_unit = "pcs" if unit and unit.lower() == "boxes" else unit

#             inventory_summary.append({
#                 'com_name': first_tx.cinv_id.com_id.com_name,
#                 'opening': display_opening,
#                 'received': received_qty,
#                 'receivedfrom': first_tx.cinv_id.cinv_recevFrom,
#                 'dispensed': dispensed_qty,
#                 'closing': closing_qty,
#                 'unit': display_unit,
#                 'expiry': expiry_date,
#                 'received_from': first_tx.cinv_id.cinv_recevFrom
#             })

#         return Response({
#             'success': True,
#             'data': {
#                 'month': month_str,
#                 'inventory_summary': inventory_summary,
#                 'total_items': len(inventory_summary)
#             }
#         })

#     def _parse_qty(self, transaction):
#         """Parse quantity number from transaction.comt_qty."""
#         match = re.search(r'\d+', str(transaction.comt_qty))
#         qty_num = int(match.group()) if match else 0

#         # Multiply by pcs if unit is boxes
#         if transaction.cinv_id.cinv_qty_unit and transaction.cinv_id.cinv_qty_unit.lower() == "boxes":
#             pcs_per_box = transaction.cinv_id.cinv_pcs or 1
#             qty_num *= pcs_per_box

#         return qty_num
