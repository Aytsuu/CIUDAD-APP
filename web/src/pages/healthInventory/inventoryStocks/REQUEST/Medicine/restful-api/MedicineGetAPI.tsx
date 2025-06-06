// medicineStockService.ts
import {api} from "@/pages/api/api";


export const getMedicineInventory = async () => {
  try {
    const res = await api.get(`inventory/medicineinventorylist/`);
    return res.data;
  } catch (err: any) {
    console.log("Error fetching medicine inventory:", err.response?.data || err.message);
    throw err;
  }
};

