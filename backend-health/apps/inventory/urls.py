from django.urls import path
from .views import *


urlpatterns = [
     
    # VIEW POST
    path("category/", CategoryView.as_view(), name="category"),

    #LIST POST
    path("medicinelist/", MedicineListView.as_view(), name="medicinelist"),
    path("commoditylist/", CommodityListView.as_view(), name="commoditylist"),
    path("firstaidlist/", FirstAidListView.as_view(), name="firstaidlist"),
  

    # DELETE CATEGORY
    path("category/<int:cat_id>/", DeleteCategoryView.as_view(), name="delete_category"),
    
    #DELETE LIST
    path("medicinelist/<int:med_id>/", DeleteMedicineListView.as_view(), name="delete_medicinelist"),
    path("firstaidlist/<int:fa_id>/", DeleteFirstAidView.as_view(), name="delete_firstaid"),
    path("commoditylist/<int:com_id>/", DeleteCommodityView.as_view(), name="delete_commodity"),

    
    
    #UPDATE LIST
    path("update_medicinelist/<int:med_id>/", MedicineListUpdateView.as_view(), name="update_medicinelist"),
    path("update_firstaidlist/<int:fa_id>/", FirstAidListUpdateView.as_view(), name="update_firstaidlist"),
    path("update_commoditylist/<int:com_id>/", CommodityListUpdateView.as_view(), name="update_commoditylist"),
    
     
    # INVENTORY  
    path("inventorylist/", InventoryView.as_view(), name="inventorylist"),
    path("update_inventorylist/<int:inv_id>/",InventoryUpdateView.as_view(), name="update_inventorylist"),

      
    # INVENTORY POST
    path("medicineinventorylist/", MedicineInventoryView.as_view(), name="medicine-inventory"),
    path("commodityinventorylist/", CommodityInventoryVIew.as_view(), name="commodity-inventory"),
    path("firstaidinventorylist/", FirstAidInventoryVIew.as_view(), name="firstaid-inventory"),

     
     #DELETE
    path("medicineinventorylist/<int:minv_id>/", DeleteMedicineInvView.as_view(), name="delete_medicinestocks"),
    path("commodityinventorylist/<int:cinv_id>/", DeleteCommodityInvView.as_view(), name="delete_commoditystocks"),
    path("firstaidinventorylist/<int:finv_id>/", DeleteFirstAidInvView.as_view(), name="delete_firstaidstocks"),
    
    #STOCKS UPDATE OR RETRIEVE
    path("update_medicinestocks/<int:minv_id>/", MedicineInvRetrieveView.as_view(), name="update_medicinestocks"),
    path("update_commoditystocks/<int:cinv_id>/", CommodityInvRetrieveView.as_view(), name="update_commoditystocks"),
    path("update_firstaidstocks/<int:finv_id>/", FirstAidInvRetrieveView.as_view(), name="update_firstaidstocks"),
    
    # ADD MEDICINE STOCKS  POST 
    path("medicinetransaction/", MedicineTransactionView.as_view(), name="medicine-transaction"),
    path("commoditytransaction/", CommodityTransactionView.as_view(), name="commodity-transaction"),
    path("firstaidtransaction/", FirstAidTransactionView.as_view(), name="firstaid-transaction"),
    
    # Vaccination
    path("vac_list/", VaccineListView.as_view(), name="vaccination-list"),
    path("vac_intervals/", VaccineIntervalView.as_view(), name="vaccination-interval"),
    path("routine_freq/", RoutineFrequencyView.as_view(), name="RoutineFrequency"),
    path("vac_categ/", VaccineCategoryView.as_view(), name="vac_cat"),
    path("imz_supplies/", ImmunizationSuppliesView.as_view(), name="imz_supplies"),
    
    
     # Vaccination - Retrieve/Update endpoints
    path("vac_list/<int:vac_id>/", VaccineListRetrieveUpdateDestroyView.as_view(), name="vaccination-detail"),
    path("vac_intervals/<int:vacInt_id>/", VaccineIntervalRetrieveUpdateDestroyView.as_view(), name="vaccination-interval-detail"),
    path("routine_freq/<int:routineF_id>/", RoutineFrequencyRetrieveUpdateDestroyView.as_view(), name="RoutineFrequency-detail"),
    path("vac_categ/<int:vaccat_id>/", VaccineCategoryRetrieveUpdateDestroyView.as_view(), name="vac_cat-detail"),
    path("imz_supplies/<int:imz_id>/", ImmunizationSuppliesRetrieveUpdateDestroyView.as_view(), name="imz_supplies-detail"),
    
    
    
    
]