import api from "@/pages/api/api";
import { MedicineStockType, InventoryType,MedicineTransactionType } from "./type";
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
export const addMedicineTransaction = async (MedTransactindata: MedicineTransactionType) => {
  try {
    const res = await api.post("inventory/medicinetransaction/",MedTransactindata);
    return res.data;
  } catch (err:any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};
