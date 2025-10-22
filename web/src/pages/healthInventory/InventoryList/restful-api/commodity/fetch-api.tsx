import { api2 } from "@/api/api";

// commodityApi.js
export const getCommodity = async (page?: number, pageSize?: number, search?: string) => {
  try {
    const res = await api2.get("inventory/commoditylist/", {
      params: { 
        page, 
        page_size: pageSize, 
        search: search?.trim() || undefined 
      }
    });
    console.log("Commodity API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Commodity API Error:", error);
    throw error;
  }
};