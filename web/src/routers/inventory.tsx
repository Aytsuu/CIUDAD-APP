import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/StocksMain";
import TransactionMainInventoryList from "@/pages/healthInventory/transaction/tables/TransactionMainInventoryList";
import AddImmunizationSupplies from "@/pages/healthInventory/InventoryList/Modal/ImmunizationSupplies";
import AddMedicineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/MedStockModal";
import AddCommodityStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ComStockModal";
import AddFirstAidStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/FirstAidStockModal";
import AddVaccineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/VacStockModal";
import AddImzSupplyStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ImmunizationSupplies";
import MainInventory from "@/pages/healthInventory/inventoryStocks/tables/MainTable";
import ArchiveMainInventoryStocks from "@/pages/healthServices/archive/Inventory/tables/MainArchiveInventoryStocks";

export const healthinventory = [
  { path: "/inventory/list", element: <MainInventoryList /> },
  { path: "/inventory/stocks", element: <MainInventory /> },
  { path: "/main-inventory-stocks", element: <MainInventoryStocks /> },
  { path: "/transactionMainInventoryList", element: <TransactionMainInventoryList /> },
  { path: "/addImmunizationSupplies", element: <AddImmunizationSupplies /> },

  // STOCKS
  { path: "/inventory/stocks/add-medicine", element: <AddMedicineStock /> },
  { path: "/inventory/stocks/add-firstaid", element: <AddFirstAidStock /> },
  { path: "/inventory/stocks/add-commodity", element: <AddCommodityStock /> },
  { path: "/inventory/stocks/add-vaccine", element: <AddVaccineStock /> },
  { path: "/inventory/stocks/add-immunization-supply", element: <AddImzSupplyStock /> },

  { path: "/archiveMainInventoryStocks", element: <ArchiveMainInventoryStocks /> }
];