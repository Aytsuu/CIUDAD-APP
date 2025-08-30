import { api2 } from "@/api/api";


// Update the getCombinedStock function
export const getCombinedStock = async (page: number, pageSize: number, search?: string, filter?: any): Promise<any> => {
  try {
    const res = await api2.get("inventory/combined-stock-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        filter: filter || "all"
      }
    });

    console.log("Combined Stock API Response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Combined Stock API Error:", error);
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
