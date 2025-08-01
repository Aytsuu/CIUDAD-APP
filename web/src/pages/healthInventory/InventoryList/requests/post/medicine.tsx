import { api2 } from "@/api/api";
import { toTitleCase } from "../case";

export const addMedicine = async (medicineName: string) => {
    try {
      const res = await api2.post("inventory/medicinelist/", {
        med_name: toTitleCase(medicineName),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };