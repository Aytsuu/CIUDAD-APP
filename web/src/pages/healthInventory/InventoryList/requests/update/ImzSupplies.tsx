
import api from "@/pages/api/api";
import { toTitleCase } from "../case";

export const updateImzSuppliesList = async (imz_id: number, comName: string) => {
  
    try {
      const res = await api.put(`inventory/imz_supplies/${imz_id}/`, {
        imz_name: toTitleCase(comName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

