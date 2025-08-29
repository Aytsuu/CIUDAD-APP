import { api2 } from "@/api/api";

export const handleDeleteCommodityList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/commoditylist/${id}/`); // API call
    return res.data;
  } catch (error) {
    console.error("Error deleting medicine:", error);
    throw error;
  }
};

