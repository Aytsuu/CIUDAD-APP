
import { api2 } from "@/api/api";
import { toTitleCase } from "../case";
import { gender_type_options } from "../../addListModal/CommodityModal";

export const updateCommodity = async (com_id: number, comName: string) => {
  
    try {
      const res = await api2.put(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(comName),
        updated_at: new Date().toISOString(),
        gender_type: gender_type_options
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

