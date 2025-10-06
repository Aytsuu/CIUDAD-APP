// medicineStockService.ts
import {api2} from "@/api/api";


export const getMedicineInventory = async () => {
  try {
    const res = await api2.get(`inventory/medicineinventorylist/`);
    return res.data;
  } catch (err: any) {
    console.log("Error fetching medicine inventory:", err.response?.data || err.message);
    throw err;
  }
};

