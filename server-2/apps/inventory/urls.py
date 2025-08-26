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

    path("inventorylist/", InventoryView.as_view(), name="inventorylist"),
    path("update_inventorylist/<str:inv_id>/",InventoryUpdateView.as_view(), name="update_inventorylist"),



    path("medicinecreateview/", MedicineCreateView.as_view(), name="medicinecreateview"),
    path("medicinetable/", MedicineListTable.as_view(), name="medicinetable"),
    path("medicinelistcount/", MedicineCountView.as_view(), name="medicinelistcount"),
    path("medicinelist/<str:med_id>/", DeleteMedicineListView.as_view(), name="delete_medicinelist"),
    path("update_medicinelist/<str:med_id>/", MedicineListUpdateView.as_view(), name="update_medicinelist"),
   
    path("medicine-stock-table/", MedicineStockTableView.as_view(), name="medicinetableview"),
    path("medicineinventorylist/", MedicineInventoryView.as_view(), name="medicine-inventory"),
    path("update_medicinestocks/<int:minv_id>/", MedicineInvRetrieveView.as_view(), name="update_medicinestocks"),
    path("medicinetransaction/", MedicineTransactionView.as_view(), name="medicine-transaction"),
    path('archive/medicine-inventory/', ArchiveMedicineInventoryView.as_view(), name='archive-medicine-inventory'),
    path("medicine_stock-create/", MedicineStockCreate.as_view(), name="medicine-stock-atomic"),


    path("commoditylist/", CommodityListView.as_view(), name="commoditylist"),
    path("commoditylistcount/", CommodityCountView.as_view(), name="commoditylistcount"),
    path("commoditylist/<str:com_id>/", DeleteCommodityView.as_view(), name="delete_commodity"),
    path("commodityinventorylist/", CommodityInventoryView.as_view(), name="commodity-inventory"),
    path("update_commoditylist/<str:com_id>/", CommodityListUpdateView.as_view(), name="update_commoditylist"),
    
    path("commodity-stock-table/",CommodityStockTableView.as_view(),name="commodity-stock-view"),
    path("update_commoditystocks/<int:cinv_id>/", CommodityInvRetrieveView.as_view(), name="update_commoditystocks"),
    path("commoditytransaction/", CommodityTransactionView.as_view(), name="commodity-transaction"),
    path('archive/commodity-inventory/', ArhiveCommodityInventoryVIew.as_view(), name='archive-commodity-inventory'),
    path('commodity-create/', CommodityStockCreate.as_view(), name='commodity-create'),
    

    path("firstaidlist/", FirstAidListView.as_view(), name="firstaidlist"),
    path("firstaidlist/<str:fa_id>/", DeleteFirstAidView.as_view(), name="delete_firstaid"),
    path("update_firstaidlist/<str:fa_id>/", FirstAidListUpdateView.as_view(), name="update_firstaidlist"),
    path("first-aid-stock-table/",FirstAidStockTableView.as_view(),name="first-aid-stocks-table"),
    path("firstaidinventorylist/", FirstAidInventoryView.as_view(), name="firstaid-inventory"),
    path("update_firstaidstocks/<int:finv_id>/", FirstAidInvRetrieveView.as_view(), name="update_firstaidstocks"),
    path('archive/first-aid-inventory/', ArchiveFirstAidInventoryVIew.as_view(), name='archive-first-aid-inventory'),
    path("firstaidtransaction/", FirstAidTransactionView.as_view(), name="firstaid-transaction"),
    path("firstaidstock-create/", FirstAidStockCreate.as_view(), name="firstaidcreateview"),
     
  

    path("vac_list/", VaccineListView.as_view(), name="vaccination-list"),
    path("vac_intervals/", VaccineIntervalView.as_view(), name="vaccination-interval"), 
    path("routine_freq/", RoutineFrequencyView.as_view(), name="RoutineFrequency"),
    path("vac_list/<int:vac_id>/", VaccineListRetrieveUpdateDestroyView.as_view(), name="vaccination-detail"),
    path("vac_intervals/<int:vacInt_id>/", VaccineIntervalRetrieveUpdateDestroyView.as_view(), name="vaccination-interval-detail"),
    path("routine_freq/<int:routineF_id>/", RoutineFrequencyRetrieveUpdateDestroyView.as_view(), name="RoutineFrequency-detail"),
    path('conditional_vaccine/', ConditionalVaccineListView.as_view(), name='conditional-vaccine'),
    path('conditional_vaccine/<int:vac_id>/', ConditionRetrieveUpdateDestroyView.as_view(), name='conditional-vaccine-detail'),
    path("vaccine_stocks/", VaccineStocksView.as_view(), name="vaccine_stocks"),
    path("vaccine_stocks/<int:vacStck_id>/", VaccineStockRetrieveUpdateDestroyView.as_view(), name="vaccine_stocks-detail"),
    path('archive/vaccine-stocks/', ArchiveVaccineStocksView.as_view(), name='archive-vaccine-stocks'),
    path("vaccine_stock-create/", VaccineStockCreate.as_view(), name="vaccine_stock_atomic"),


    
    path("imz_supplieslist-table/", ImmunizationSuppliesListTable.as_view(), name="imz_supplies-list"),
    path("imz_supplieslist-view/", ImmunizationSuppliesListCreateView.as_view(), name="imz_supplies-list-createview"),
    path("imz_supplies/<int:imz_id>/", ImmunizationSuppliesRetrieveUpdateDestroyView.as_view(), name="imz_supplies-detail"),
    path("immunization_stock/", ImmunizationStockSuppliesView.as_view(), name="immunization_stocksn"),
    path("immunization_stock/<int:imzStck_id>/", ImmunizationSuppliesStockRetrieveUpdateDestroyView.as_view(), name="immunization_stocks-detail"),
    path('archive/immunization-supplies/', ArchiveImmunizationSuppliesStockListView.as_view(), name='archive-immunization-supplies'),
    path("immunization_stock-create/", ImmunizationStockCreate.as_view(), name="immunization_stock_atomic"),

    path("combined_vaccine_data/", CombinedVaccineDataView.as_view(), name="combined-vaccine-data"),
    path("combined-stock-table/", CombinedStockTable.as_view(), name="combined-stock"),
    path("antigens_stocks/transaction/", AntigenTransactionView.as_view(), name="antigens_stocks"), 

    path("age_group/", AgeGroupView.as_view(), name="age_group-detail"),
    path("age_group/<int:agegrp_id>/", DeleteUpdateAgeGroupView.as_view(), name="age_group-detail"),
    
  

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