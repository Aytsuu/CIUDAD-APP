
import {api2} from "@/api/api";

export const handleDeleteFirstAidList = async (id: string) => {
    try {
      const res = await api2.delete(`inventory/firstaidlist/${id}/`); // API call
      return res.data; // Return the response data
    } catch (error) {
      console.error("Error deleting firstAid:", error);
      throw error; // Re-throw the error for further handling
    }
  };
  