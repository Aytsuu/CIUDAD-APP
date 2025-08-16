import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/StocksMain";
import TransactionMainInventoryList from "@/pages/healthInventory/transaction/tables/TransactionMainInventoryList";
import AddImmunizationSupplies from "@/pages/healthInventory/InventoryList/Modal/ImmunizationSupplies";
import AddMedicineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/MedStockModal";
import AddCommodityStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ComStockModal";
import AddFirstAidStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/FirstAidStockModal";
import AddVaccineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/VacStockModal";
import AddImzSupplyStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ImmunizationSupplies";
import WastedAntigen from "@/pages/healthInventory/inventoryStocks/addstocksModal/WastedDoseModal";
import ArchiveMainInventoryStocks from "@/pages/healthServices/Archive/Inventory/tables/MainArchiveInventoryStocks";
import MainInventory from "@/pages/healthInventory/inventoryStocks/tables/MainTable";


export const healthinventory = [
{path: "/mainInventoryList",element: <MainInventoryList />,},
{path: "/main-inventory",element: <MainInventory />,},
{path: "/main-inventory-stocks",element: <MainInventoryStocks />},
{path: "/transactionMainInventoryList",element: <TransactionMainInventoryList />,},
{path: "/addImmunizationSupplies", element: <AddImmunizationSupplies />}, 



// STOCKS
{path: "/addMedicineStock", element: <AddMedicineStock />}, 
{path: "/addFirstAidStock", element: <AddFirstAidStock />}, 
{path: "/addCommodityStock", element: <AddCommodityStock />}, 
{path: "/addVaccineStock", element: <AddVaccineStock />}, 
{path: "/addImzSupplyStock", element: <AddImzSupplyStock />}, 
{path: "/wastedAntigen", element: <WastedAntigen />},


{path: "/archiveMainInventoryStocks", element: <ArchiveMainInventoryStocks />},

];
