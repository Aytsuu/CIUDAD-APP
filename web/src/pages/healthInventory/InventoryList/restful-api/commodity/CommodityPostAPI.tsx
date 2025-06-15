import {api} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const addCommodity = async (data: Record<string,string>) => {
    try {
      const res = await api.post("inventory/commoditylist/", {
        com_name: toTitleCase(data.com_name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };