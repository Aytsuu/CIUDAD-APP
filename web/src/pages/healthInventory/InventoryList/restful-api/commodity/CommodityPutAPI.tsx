
import {api} from "@/pages/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const updateCommodity = async (com_id: string, data:Record<string,string>) => {
  
    try {
      const res = await api.put(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(data.comName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

