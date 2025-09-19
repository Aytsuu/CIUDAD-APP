import {api2} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const addMedicine = async (data : Record<string, string>) => {
    try {
      const res = await api2.post("inventory/medicinecreateview/", {
        med_name: toTitleCase(data.medicineName),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        med_type: data.med_type ? toTitleCase(data.med_type) : null,
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };