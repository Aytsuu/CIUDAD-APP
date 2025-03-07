import MedicineRecord from "@/pages/healthInventory/inventoryStocks/stocksRecord/VaccineStocks";
import MedicineList from "@/pages/healthInventory/InventoryList/listRecord/MedicineList";
import CommodityList from "@/pages/healthInventory/InventoryList/listRecord/CommodityList";
import VaccinationList from "@/pages/healthInventory/InventoryList/listRecord/VaccineList";
import FirstAidList from "@/pages/healthInventory/InventoryList/listRecord/FirstAidList";
import MainInventoryList from "@/pages/healthInventory/InventoryList/listRecord/MainInventoryList";


export const healthinventory = [
  {
    path: "/mainInventoryList",
    element: <MainInventoryList />,
  },
  {
    path: "/medicineStocks",
    element: <MedicineRecord />,
  },
  {
    path: "/medicineList",
    element: <MedicineList />,
  },
  {
    path: "/commodityList",
    element: <CommodityList />,
  },
  {
   path: "/vaccinationList",
   element: <VaccinationList />,
 },
 {
  path: "/firstAidList",
  element: <FirstAidList />,
},


];
