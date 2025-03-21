import api from "@/pages/api/api";
import { MedicineStockType, InventoryType } from "../addstocksModal/type";
import { log } from "console";

// medicine inventory details
export const addMedicineInventory = async (medicineData: MedicineStockType) => {
  try {
    const res = await api.post(
      "inventory/medicineinventorylist/",
      medicineData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const addInventory = async (inventoryData: InventoryType) => {
  try {
    console.log("Sending payload:", inventoryData); // Log the payload
    const res = await api.post("inventory/inventorylist/", inventoryData);
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

// add stocks for medicine
export const addMedicineStocks = async () => {
  try {
    const res = await api.post("inventory/addmedicinestocks");
    return res.data;
  } catch (err:any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};
