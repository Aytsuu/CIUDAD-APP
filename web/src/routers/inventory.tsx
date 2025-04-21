import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/MainInventoryStocks";
import TransactionMainInventoryList from "@/pages/healthInventory/transaction/tables/TransactionMainInventoryList";

export const healthinventory = [
  {
    path: "/mainInventoryList",
    element: <MainInventoryList />,
  },

{
  path: "/mainInventoryStocks",
  element: <MainInventoryStocks />,
},
{
  path: "/transactionMainInventoryList",
  element: <TransactionMainInventoryList />,
},


];
