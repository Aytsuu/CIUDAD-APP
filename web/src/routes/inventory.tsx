import MainInventoryList from "@/pages/healthInventory/InventoryList/tables/MainInventoryList";
import MainInventoryStocks from "@/pages/healthInventory/inventoryStocks/tables/MainInventoryStocks";


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
