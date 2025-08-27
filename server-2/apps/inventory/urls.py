from django.urls import path
from .views import *
from .views.inventory_views import *
from .views.vaccination_views import *
from .views.commodity_views import *
from .views.medicine_views import *
from .views.firstaid_views import *


urlpatterns = [
     
    path("category/", CategoryView.as_view(), name="category"),
    path("category/<int:cat_id>/", DeleteCategoryView.as_view(), name="delete_category"),


    path("medicinecreateview/", MedicineCreateView.as_view(), name="medicinecreateview"),
    path("medicinetable/", MedicineListTable.as_view(), name="medicinetable"),
    path("medicinelistcount/", MedicineCountView.as_view(), name="medicinelistcount"),

    path("commoditylist/", CommodityListView.as_view(), name="commoditylist"),
    path("commoditylistcount/", CommodityCountView.as_view(), name="commoditylistcount"),
    path("firstaidlist/", FirstAidListView.as_view(), name="firstaidlist"),
  
    
    #DELETE LIST
    path("medicinelist/<str:med_id>/", DeleteMedicineListView.as_view(), name="delete_medicinelist"),
    path("firstaidlist/<str:fa_id>/", DeleteFirstAidView.as_view(), name="delete_firstaid"),
    path("commoditylist/<str:com_id>/", DeleteCommodityView.as_view(), name="delete_commodity"),
    
    #UPDATE LIST
    path("update_medicinelist/<str:med_id>/", MedicineListUpdateView.as_view(), name="update_medicinelist"),
    path("update_firstaidlist/<str:fa_id>/", FirstAidListUpdateView.as_view(), name="update_firstaidlist"),
    path("update_commoditylist/<str:com_id>/", CommodityListUpdateView.as_view(), name="update_commoditylist"),
    
     
    # INVENTORY  
    path("inventorylist/", InventoryView.as_view(), name="inventorylist"),
    path("update_inventorylist/<str:inv_id>/",InventoryUpdateView.as_view(), name="update_inventorylist"),

    # INVENTORY POST
    path("medicineinventorylist/", MedicineInventoryView.as_view(), name="medicine-inventory"),
    path("commodityinventorylist/", CommodityInventoryVIew.as_view(), name="commodity-inventory"),
    path("firstaidinventorylist/", FirstAidInventoryVIew.as_view(), name="firstaid-inventory"),

    
    #STOCKS UPDATE OR RETRIEVE
    path("update_medicinestocks/<int:minv_id>/", MedicineInvRetrieveView.as_view(), name="update_medicinestocks"),
    path("update_commoditystocks/<int:cinv_id>/", CommodityInvRetrieveView.as_view(), name="update_commoditystocks"),
    path("update_firstaidstocks/<int:finv_id>/", FirstAidInvRetrieveView.as_view(), name="update_firstaidstocks"),
    
   
    # Vaccination 
    path("vac_list/", VaccineListView.as_view(), name="vaccination-list"),
    path("vac_intervals/", VaccineIntervalView.as_view(), name="vaccination-interval"), 
    path("routine_freq/", RoutineFrequencyView.as_view(), name="RoutineFrequency"),
    
    path("imz_supplieslist-table/", ImmunizationSuppliesListTable.as_view(), name="imz_supplies-list"),
    path("imz_supplieslist-createview/", ImmunizationSuppliesListCreateView.as_view(), name="imz_supplies-list-createview"),
    
     # Vaccination 
    path("vac_list/<int:vac_id>/", VaccineListRetrieveUpdateDestroyView.as_view(), name="vaccination-detail"),
    path("vac_intervals/<int:vacInt_id>/", VaccineIntervalRetrieveUpdateDestroyView.as_view(), name="vaccination-interval-detail"),
    path("routine_freq/<int:routineF_id>/", RoutineFrequencyRetrieveUpdateDestroyView.as_view(), name="RoutineFrequency-detail"),
    path("imz_supplies/<int:imz_id>/", ImmunizationSuppliesRetrieveUpdateDestroyView.as_view(), name="imz_supplies-detail"),
    path('conditional_vaccine/', ConditionalVaccineListView.as_view(), name='conditional-vaccine'),
    path('conditional_vaccine/<int:vac_id>/', ConditionRetrieveUpdateDestroyView.as_view(), name='conditional-vaccine-detail'),
    
    
    # VACCINE STOCKS 
    path("vaccine_stocks/", VaccineStocksView.as_view(), name="vaccine_stocks"),
    path("immunization_stock/", ImmunizationStockSuppliesView.as_view(), name="immunization_stocksn"),
    path("vaccine_stocks/<int:vacStck_id>/", VaccineStockRetrieveUpdateDestroyView.as_view(), name="vaccine_stocks-detail"),
    path("immunization_stock/<int:imzStck_id>/", ImmunizationSuppliesStockRetrieveUpdateDestroyView.as_view(), name="immunization_stocks-detail"),
   
       path("combined_vaccine_data/", CombinedVaccineDataView.as_view(), name="combined-vaccine-data"),

   
    # TRANSACTION
    path("medicinetransaction/", MedicineTransactionView.as_view(), name="medicine-transaction"),
    path("commoditytransaction/", CommodityTransactionView.as_view(), name="commodity-transaction"),
    path("firstaidtransaction/", FirstAidTransactionView.as_view(), name="firstaid-transaction"),
      path("antigens_stocks/transaction/", AntigenTransactionView.as_view(), name="antigens_stocks"), 

    # AGE GROUPS
    path("age_group/", AgeGroupView.as_view(), name="age_group-detail"),
    path("age_group/<int:agegrp_id>/", DeleteUpdateAgeGroupView.as_view(), name="age_group-detail"),
    
    # ARCHIVE
    path('archive/immunization-supplies/', ArchiveImmunizationSuppliesStockListView.as_view(), name='archive-immunization-supplies'),
    path('archive/vaccine-stocks/', ArchiveVaccineStocksView.as_view(), name='archive-vaccine-stocks'),
    path('archive/medicine-inventory/', ArchiveMedicineInventoryView.as_view(), name='archive-medicine-inventory'),
    path('archive/commodity-inventory/', ArhiveCommodityInventoryVIew.as_view(), name='archive-commodity-inventory'),
    path('archive/first-aid-inventory/', ArchiveFirstAidInventoryVIew.as_view(), name='archive-first-aid-inventory'),
    
    # REPORTS
    path('commodity/summaries/',CommoditySummaryMonthsAPIView.as_view(),name='commodity-monthly-summaries'),
    path('commodity/records/<str:month>/',MonthlyCommodityRecordsDetailAPIView.as_view(),name='commodity-monthly-records'),
    path('medicine/records/<str:month>/',MonthlyMedicineRecordsDetailAPIView.as_view(),name='medicine-monthly-records'),
    path( 'medicine/summaries/', MedicineSummaryMonthsAPIView.as_view(), name='medicine-summary-montly'),
    path('firstaid/summaries/', FirstAidSummaryMonthsAPIView.as_view(), name='firstaid-summary-montly'),
    path('firstaid/records/<str:month>/', MonthlyFirstAidRecordsDetailAPIView.as_view(), name='firstaid-monthly-records'),
    path('vaccine/summaries/', VaccinationSummaryMonthsAPIView.as_view(), name='vaccine-summary-montly'),
    path('vaccine/records/<str:month>/', MonthlyVaccinationRecordsDetailAPIView.as_view(), name='vaccine-monthly-records'),
    
] 