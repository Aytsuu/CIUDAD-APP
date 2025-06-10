import {api} from "@/pages/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { ca } from "date-fns/locale";


export const updateMedicine = async (med_id: string, data : Record<string,any>) => {

    try {
      const res = await api.put(`inventory/update_medicinelist/${med_id}/`, {
        med_name: toTitleCase(data.medicineName),
        updated_at: new Date().toISOString(),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        med_type: data.med_type ? toTitleCase(data.med_type) : null,
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to handle it in the calling function
    }
  };