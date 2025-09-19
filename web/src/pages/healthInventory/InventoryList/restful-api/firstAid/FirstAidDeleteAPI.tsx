import { api2 } from "@/api/api";

export const handleDeleteFirstAidList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/firstaidlist/${id}/`); 
    return res.data; 
  } catch (error) {
    console.error("Error deleting firstAid:", error);
    throw error; 
  }
};
