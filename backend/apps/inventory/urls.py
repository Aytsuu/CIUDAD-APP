from django.urls import path
from .views import *


urlpatterns = [
    
    # VIEW
    path("category/", CategoryView.as_view(), name="category"),
    path("inventorylist/", InventoryView.as_view(), name="inventorylist"),
    
    #LIST
    path("medicinelist/", MedicineListView.as_view(), name="medicinelist"),
    path("commoditylist/", MedicineListView.as_view(), name="commoditylist"),
    path("vaccinelist/", MedicineListView.as_view(), name="vaccinelist"),
    
    #STOCKS
    path("medicinestocks/", MedicineListView.as_view(), name="inventorylist"),
    
    
    # DELETE
    path("delete_category/<int:cat_id>/", DeleteCategoryView.as_view(), name="delete_category")

    
    
]