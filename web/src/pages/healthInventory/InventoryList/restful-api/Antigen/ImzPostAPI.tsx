
import {api} from "@/pages/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const addImzSupplies = async (data: Record<string,string>) => {
    try {
      const res = await api.post("inventory/imz_supplies/", {
        imz_name: toTitleCase(data.imz_name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  