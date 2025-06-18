import { api } from "@/api/api";
import { toTitleCase } from "../case";


export const updateMedicine = async (med_id: number, medicineName: string) => {

    try {
      const res = await api.put(`inventory/update_medicinelist/${med_id}/`, {
        med_name: toTitleCase(medicineName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to handle it in the calling function
    }
  };