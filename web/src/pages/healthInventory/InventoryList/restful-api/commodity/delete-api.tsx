import { api2 } from "@/api/api";

export const handleDeleteCommodityList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/commoditylist/${id}/`); // API call
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting medicine:", error);
    }
    // DEVELOPMENT MODE ONLY: No throw in production
  }
};

