import { api2 } from "@/api/api";

export const handleDeleteFirstAidList = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/firstaidlist/${id}/`); 
    return res.data; 
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting firstAid:", error);
    }
    // DEVELOPMENT MODE ONLY: No throw in production
  }
};
