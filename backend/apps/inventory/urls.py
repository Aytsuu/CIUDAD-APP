from django.urls import path
from .views import *


urlpatterns = [
    
    # VIEW POST
    path("category/", CategoryView.as_view(), name="category"),
    path("inventorylist/", InventoryView.as_view(), name="inventorylist"),
    
    #LIST POST
    path("medicinelist/", MedicineListView.as_view(), name="medicinelist"),
    path("commoditylist/", CommodityListView.as_view(), name="commoditylist"),
    path("firstaidlist/", FirstAidListView.as_view(), name="firstaidlist"),
    
    #STOCKS POST
    path("medicinestocks/", MedicineListView.as_view(), name="inventorylist"),
    

    # DELETE CATEGORY
    path("category/<int:cat_id>/", DeleteCategoryView.as_view(), name="delete_category"),
    
    #DELETE LIST
    path("medicinelist/<int:med_id>/", DeleteMedicineListView.as_view(), name="delete_medicinelist"),
    path("firstaidlist/<int:fa_id>/", DeleteFirstAidView.as_view(), name="delete_firstaid"),
    
    
    #UPDATE LIST
    path("update_medicinelist/<int:med_id>/", MedicineListUpdateView.as_view(), name="update_medicinelist")

    
    
]