import {api2} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const addCommodity = async (data: Record<string,string>) => {
    try {
      const res = await api2.post("inventory/commoditylist/", {
        com_name: toTitleCase(data.com_name),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_type:data.user_type,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };