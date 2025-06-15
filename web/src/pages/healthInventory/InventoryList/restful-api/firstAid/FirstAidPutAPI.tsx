
import {api} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const updateFirstAid = async (fa_id: string, data:Record<string,string>) => {
  
    try {
      const res = await api.put(`inventory/update_firstaidlist/${fa_id}/`, {
        fa_name: toTitleCase(data.fa_name),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };