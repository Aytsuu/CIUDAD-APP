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

      
    #STOCKS POST
    path("medicineinventorylist/", MedicineInventoryView.as_view(), name="medicine-inventory"),
     #DELETE
    path("medicineinventorylist/<int:minv_id>/", DeleteMedicineInvView.as_view(), name="delete_medicinestocks"),

    
    #STOCKS UPDATE OR RETRIEVE
    path("update_medicinestocks/<int:minv_id>/", MedicineInvRetrieveView.as_view(), name="update_medicinestocks"),
      
    
    #ADD MEDICINE STOCKS  POST
    path("medicinetransaction/", MedicineTransactionView.as_view(), name="medicine-transaction"),
    
    
    
]