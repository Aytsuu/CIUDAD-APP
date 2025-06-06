
import {api} from "@/pages/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const updateImzSuppliesList = async (imz_id: number, imz_name: string) => {
  
    try {
      const res = await api.put(`inventory/imz_supplies/${imz_id}/`, {
        imz_name: toTitleCase(imz_name),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

