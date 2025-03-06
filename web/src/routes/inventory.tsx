import MedicineRecord from "@/pages/healthInventory/medicineRecord";
import MedicineList from "@/pages/healthInventory/InventoryList/inventoryRecord/MedicineList";
import CommodityList from "@/pages/healthInventory/InventoryList/inventoryRecord/CommodityList";
import VaccinationList from "@/pages/healthInventory/InventoryList/inventoryRecord/VaccineList";
import FirstAidList from "@/pages/healthInventory/InventoryList/inventoryRecord/FirstAidList";
export const healthinventory = [
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
