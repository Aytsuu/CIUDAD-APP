import api from "@/pages/api/api";
import { MedicineStockType, InventoryType,MedicineTransactionType, FirstAidStockType } from "../REQUEST/type";
import { log } from "console";
import { addCommodity } from "../../InventoryList/requests/Postrequest";
import { CommodityStockType } from "../REQUEST/type";
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


export const  addCommodityInventory = async (commodityData: CommodityStockType) => {
  try {
    const res = await api.post(
      "inventory/commodityinventorylist/",
      commodityData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
}

export const  addFirstAidInventory = async (commodityData: FirstAidStockType) => {
  try {
    const res = await api.post(
      "inventory/commodityinventorylist/",
      commodityData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
}

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
