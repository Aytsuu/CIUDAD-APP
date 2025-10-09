import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/StocksMain";
import TransactionMainInventoryList from "@/pages/healthInventory/transaction/tables/TransactionMainInventoryList";
// import AddImmunizationSupplies from "@/pages/healthInventory/InventoryList/Modal/ImmunizationSupplies";
import AddMedicineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/MedStockModal";
import AddCommodityStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ComStockModal";
import AddFirstAidStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/FirstAidStockModal";
import AddVaccineStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/VacStockModal";
import AddImzSupplyStock from "@/pages/healthInventory/inventoryStocks/addstocksModal/ImmunizationSupplies";
import MainInventory from "@/pages/healthInventory/inventoryStocks/tables/MainTable";
import ArchiveMainInventoryStocks from "@/pages/healthServices/archive/Inventory/tables/MainArchiveInventoryStocks";
import AgeGroup from "@/pages/healthServices/agegroup/AgeGroup";
import InventoryLayout from "@/pages/healthInventory/InventoryList/InventoryListLayout";
import MedicineList from "@/pages/healthInventory/InventoryList/tables/MedicineList";
import AntigenList from "@/pages/healthInventory/InventoryList/tables/AntigenList";
import CommodityList from "@/pages/healthInventory/InventoryList/tables/CommodityList";
import FirstAidList from "@/pages/healthInventory/InventoryList/tables/FirstAidList";
import MedicineStocks from "@/pages/healthInventory/inventoryStocks/tables/MedicineStocks";
import CommodityStocks from "@/pages/healthInventory/inventoryStocks/tables/CommodityStocks";
import VaccineStocks from "@/pages/healthInventory/inventoryStocks/tables/VaccineStocks";
import MedicineArchiveTable from "@/pages/healthServices/archive/Inventory/tables/MedicineStocks";
import CombinedStockTable from "@/pages/healthServices/archive/Inventory/tables/VaccineStocks";
import CommodityArchiveTable from "@/pages/healthServices/archive/Inventory/tables/CommodityStocks";
import MedicineTransactionTable from "@/pages/healthInventory/transaction/tables/TransactionMedicineList";
import AntigenTransactionTable from "@/pages/healthInventory/transaction/tables/TransactionAntigen";
import CommodityTransactionTable from "@/pages/healthInventory/transaction/tables/TransactionCommodityList";
import FirstAidTransactionTable from "@/pages/healthInventory/transaction/tables/TransactionFirstAidList";
import InventoryStocksLayout from "@/pages/healthInventory/inventoryStocks/InventoryStocksLayout";
import FirstAidStocks from "@/pages/healthInventory/inventoryStocks/tables/FirstAidStocks";


export const healthinventory = [
  {
    path: "inventory",
    element: <InventoryLayout />,
    children: [
      // LIST routes - Separate feature for inventory list management
      {
        path: "list",
        element: <MainInventoryList />,
        children: [
          {
            path: "medicine",
            element: <MedicineList />
          },
          {
            path: "antigen",
            element: <AntigenList />
          },
          {
            path: "commodity",
            element: <CommodityList />
          },
          {
            path: "firstaid",
            element: <FirstAidList />
          }
        ]
      }
    ]
  },

  {
    path: "inventory-stocks",
    element: <InventoryStocksLayout />,
    children: [
      {
        path: "list",
        element: <MainInventory />,
        children: [
          {
            path: "stocks",
            element: <MainInventoryStocks />,
            children: [
              { path: "medicine", element: <MedicineStocks /> },
              { path: "antigen", element: <VaccineStocks /> },
              { path: "commodity", element: <CommodityStocks /> },
              { path: "firstaid", element: <FirstAidStocks /> }
            ]
          },
          {
            path: "archive",
            element: <ArchiveMainInventoryStocks />,
            children: [
              { path: "medicine", element: <MedicineArchiveTable /> },
              { path: "antigen", element: <CombinedStockTable /> },
              { path: "commodity", element: <CommodityArchiveTable /> },
              { path: "firstaid", element: <MedicineArchiveTable /> }
            ]
          },
          {
            path: "transaction",
            element: <TransactionMainInventoryList />,
            children: [
              { path: "medicine", element: <MedicineTransactionTable /> },
              { path: "antigen", element: <AntigenTransactionTable /> },
              { path: "commodity", element: <CommodityTransactionTable /> },
              { path: "firstaid", element: <FirstAidTransactionTable /> }
            ]
          }
        ]
      }
    ]
  },

  { path: "inventory-stocks/list/stocks/medicine/add", element: <AddMedicineStock /> },
  { path: "inventory-stocks/list/stocks/antigen/vaccine/add", element: <AddVaccineStock /> },
  { path: "inventory-stocks/list/stocks/commodity/add", element: <AddCommodityStock /> },
  { path: "inventory-stocks/list/stocks/firstaid/add", element: <AddFirstAidStock /> },
  { path: "inventory-stocks/list/stocks/immunization-supply/add", element: <AddImzSupplyStock /> },

  { path: "age-group", element: <AgeGroup /> }
];
