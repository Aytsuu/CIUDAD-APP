
import { api } from "@/pages/api/api";
import { toTitleCase } from "../case";

export const addImzSupplies = async (imz_name: string) => {
    try {
      const res = await api.post("inventory/imz_supplies/", {
        imz_name: toTitleCase(imz_name),
        vaccat_id : 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  