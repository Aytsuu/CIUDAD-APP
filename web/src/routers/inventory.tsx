import MainInventoryList from "@/pages/healthInventory/InventoryList/listRecord/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/stocksRecord/MainInventoryStocks";


export const healthinventory = [
  {
    path: "/mainInventoryList",
    element: <MainInventoryList />,
  },

{
  path: "/mainInventoryStocks",
  element: <MainInventoryStocks />,
},


];
