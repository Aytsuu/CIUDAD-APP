import { api2 } from "@/api/api";

// firstAidApi.js
export const getFirstAid = async (page?: number, pageSize?: number, search?: string) => {
  try {
    const res = await api2.get("inventory/firstaidlist/", {
      params: { 
        page, 
        page_size: pageSize, 
        search: search?.trim() || undefined 
      }
    });
    return res.data;
  } catch (error) {
    console.error("First Aid API Error:", error);
    throw error;
  }
};