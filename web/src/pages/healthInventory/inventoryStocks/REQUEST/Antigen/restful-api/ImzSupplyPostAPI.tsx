// REQUEST/InventoryStock.ts
import { api2 } from "@/api/api";

export const createImmunizationStock = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("inventory/immunization_stock-create/", data);
    return response?.data;
  } catch (err) {
    console.error(err);
    throw err; 
  }
};

export const addAntigenTransaction = async (data:Record<any,string>) => {
  try {
    const res = await api2.post("inventory/antigens_stocks/transaction/",data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
