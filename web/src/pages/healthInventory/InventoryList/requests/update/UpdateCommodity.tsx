
import { api2 } from "@/api/api";
import { toTitleCase } from "../case";

export const updateCommodity = async (com_id: number, comName: string) => {
  
    try {
      const res = await api2.put(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(comName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

