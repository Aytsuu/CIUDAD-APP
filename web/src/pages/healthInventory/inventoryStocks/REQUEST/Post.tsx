import api from "@/pages/api/api";
import {MedicineStockType, InventoryType,MedicineTransactionType, FirstAidStockType, CommodityTransactionType, FirstAidTransactionType, VaccineStockType, AntigenTransactionType } from "../REQUEST/type";

import { log } from "console";
import { addCommodity } from "../../InventoryList/requests/Postrequest";
import { CommodityStockType } from "../REQUEST/type";
import { ImmunizationSuppliesType,  } from "@/form-schema/inventory/inventoryStocksSchema";
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

export const  addFirstAidInventory = async (firstAidData: FirstAidStockType) => {
  try {
    const res = await api.post(
      "inventory/firstaidinventorylist/",
      firstAidData
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


// add stocks for medicine
export const addCommodityTransaction = async (ComTransactindata: CommodityTransactionType) => {
  try {
    const res = await api.post("inventory/commoditytransaction/",ComTransactindata);
    return res.data;
  } catch (err:any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};



// add stocks for medicine
export const addFirstAidTransaction = async (FirstAidTransacindata: FirstAidTransactionType) => {
  try {
    const res = await api.post("inventory/firstaidtransaction/",FirstAidTransacindata);
    return res.data;
  } catch (err:any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};



// REQUEST/Post.ts
export const addVaccineStock = async (vaccineStockData: VaccineStockType, vac_id: number, inv_id : number) => {
  try {
    const payload = {
      inv_id: inv_id, // Ensure this is a number
      vac_id: vac_id, // Ensure this is a number
      batch_number: vaccineStockData.batchNumber,
      solvent: vaccineStockData.solvent,
      volume: vaccineStockData.volume || 0,
      qty: vaccineStockData.qty,
      dose_ml: vaccineStockData.solvent === 'doses' ? vaccineStockData.dose_ml : 0,
      expiry_date: vaccineStockData.expiryDate, // Should already be in YYYY-MM-DD format
    };

    const res = await api.post("inventory/vaccine_stocks/", payload);
    return res.data;
  } catch (err) {
    console.error(err); // Log the full error response
    throw err;
  }
};



// add stocks for medicine
export const AntigenTransaction = async (AntigenData: AntigenTransactionType ) => {
  try {
    const res = await api.post("inventory/antigens_stocks/",AntigenData);
    return res.data;
  } catch (err:any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};