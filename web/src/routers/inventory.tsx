import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/MainInventoryStocks";
import TransactionMainInventoryList from "@/pages/healthInventory/transaction/tables/TransactionMainInventoryList";
import MedicineModal from "@/pages/healthInventory/InventoryList/addListModal/MedicineModal";
import MedicineListEdit from "@/pages/healthInventory/InventoryList/editListModal/EditMedicineModal";
import path from "path";
import CommodityModal from "@/pages/healthInventory/InventoryList/addListModal/CommodityModal";
import CommodityEditModal from "@/pages/healthInventory/InventoryList/editListModal/EditCommodityModal";
import FirstAidModal from "@/pages/healthInventory/InventoryList/addListModal/FirstAidModal";
import FirstAidListEdit from "@/pages/healthInventory/InventoryList/editListModal/EditFirstAidModal";
import AddVaccinationList from "@/pages/healthInventory/InventoryList/addListModal/VaccineModal";
import AddImmunizationSupplies from "@/pages/healthInventory/InventoryList/addListModal/ImmunizationSupplies";
import EditVaccineModal from "@/pages/healthInventory/InventoryList/editListModal/EditVaccineModal";
import EditImmunizationSupplies from "@/pages/healthInventory/InventoryList/editListModal/EditImmunizationSuppies";
import AddMedicineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/MedStockModal";
import AddCommodityStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ComStockModal";
import AddFirstAidStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/FirstAidStockModal";
import AddVaccineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/VacStockModal";
import AddImzSupplyStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ImmunizationSupplies";
import EditVaccineStock from "@/pages/healthInventory/inventoryStocks/editModal/EditVacStockModal";
import EditCommodityStock from "@/pages/healthInventory/inventoryStocks/editModal/EditComStockModal";
import EditFirstAidStock from "@/pages/healthInventory/inventoryStocks/editModal/EditFirstAidStockModal";
import EditMedicineStock from "@/pages/healthInventory/inventoryStocks/editModal/EditMedStockModal";
import EditImzSupplyStock from "@/pages/healthInventory/inventoryStocks/editModal/EditImzSupply";
import UsedFirstAidStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/UsedFAModal";
import WastedAntigen from "@/pages/healthInventory/inventoryStocks/addstocksModal/WastedDoseModal";
import ArchiveMainInventoryStocks from "@/pages/healthServices/Archive/Inventory/tables/MainArchiveInventoryStocks";

export const healthinventory = [
{path: "/mainInventoryList",element: <MainInventoryList />,},
{path: "/mainInventoryStocks",element: <MainInventoryStocks />},
{path: "/transactionMainInventoryList",element: <TransactionMainInventoryList />,},
{path: "/addMedicineList",element: <MedicineModal />,},
{path: "/addCommodityList", element: <CommodityModal />,},
{path: "/addFirstAidList",element: <FirstAidModal />,},
{path: "/addVaccinationList", element:<AddVaccinationList/> },
{path: "/addImmunizationSupplies", element: <AddImmunizationSupplies />}, 
{path: "/editVaccineModal", element: <EditVaccineModal />}, 
{path: "/editImmunizationSupplies", element: <EditImmunizationSupplies />}, 
{path: "/editCommodityList",element: <CommodityEditModal />,},
{path: "/editFirstAidList", element: <FirstAidListEdit />,},
{path: "/editMedicineList", element: <MedicineListEdit />,},



// STOCKS
{path: "/addMedicineStock", element: <AddMedicineStock />}, 
{path: "/addFirstAidStock", element: <AddFirstAidStock />}, 
{path: "/addCommodityStock", element: <AddCommodityStock />}, 
{path: "/addVaccineStock", element: <AddVaccineStock />}, 
{path: "/addImzSupplyStock", element: <AddImzSupplyStock />}, 
{path: "/editMedicineStock", element: <EditMedicineStock />}, 
{path: "/editCommodityStock", element: <EditCommodityStock />}, 
{path: "/editFirstAidStock", element: <EditFirstAidStock />}, 
{path: "/editImzSupplyStock", element: <EditImzSupplyStock />}, 
{path: "/editVaccineStock", element: <EditVaccineStock />}, 
{path: "/usedFirstAidStock", element: <UsedFirstAidStock />}, 
{path: "/wastedAntigen", element: <WastedAntigen />},


{path: "/archiveMainInventoryStocks", element: <ArchiveMainInventoryStocks />},

];
