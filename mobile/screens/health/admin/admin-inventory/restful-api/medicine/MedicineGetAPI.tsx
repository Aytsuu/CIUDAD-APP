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



export const getMedicineStocks = async (
  page: number, 
  pageSize: number, 
  search?: string, 
  filter?: string
): Promise<any> => {
  try {
    const res = await api2.get("inventory/medicine-stock-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        filter: filter || "all"
      }
    });

    console.log("Medicine Stock API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Medicine Stock API Error:", error);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
      filter_counts: {
        out_of_stock: 0,
        low_stock: 0,
        near_expiry: 0,
        expired: 0,
        total: 0
      }
    };
  }
};