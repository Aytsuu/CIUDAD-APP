import {api} from "@/pages/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const addCommodity = async (commodityName: string) => {
    try {
      const res = await api.post("inventory/commoditylist/", {
        com_name: toTitleCase(commodityName),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };