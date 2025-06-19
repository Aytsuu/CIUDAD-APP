
import { api2 } from "@/api/api";
import { toTitleCase } from "../case";

export const updateFirstAid = async (fa_id: number, firstAidName: string) => {
  
    try {
      const res = await api2.put(`inventory/update_firstaidlist/${fa_id}/`, {
        fa_name: toTitleCase(firstAidName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };