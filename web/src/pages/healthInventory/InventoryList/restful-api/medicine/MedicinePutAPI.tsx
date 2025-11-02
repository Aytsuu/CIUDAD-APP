import {api2} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";


export const updateMedicine = async (med_id: string, data : Record<string,any>) => {

    try {
      const res = await api2.put(`inventory/update_medicinelist/${med_id}/`, {
        med_name: toTitleCase(data.medicineName),
        med_dsg: data.med_dsg ? parseInt(data.med_dsg, 10) : null,
        med_dsg_unit: data.med_dsg_unit ? toTitleCase(data.med_dsg_unit) : null,
        med_form: data.med_form ? toTitleCase(data.med_form) : null,
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