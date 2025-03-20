import api from "@/pages/api/api";
import { MedicineInventoryPayload, InventoryPayload } from "../addstocksModal/type";

// Function to add medicine inventory
export const addMedicineInventory = async (medicineData: MedicineInventoryPayload) => {
  try {
    const res = await api.post("inventory/medicineinventorylist/", medicineData);
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const addInventory = async (inventoryData: InventoryPayload) => {
  try {
    console.log("Sending payload:", inventoryData);  // Log the payload
    const res = await api.post("inventory/inventorylist/", inventoryData);
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};