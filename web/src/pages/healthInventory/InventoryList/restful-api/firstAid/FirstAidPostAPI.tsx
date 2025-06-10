import { toTitleCase } from "@/helpers/ToTitleCase";
import {api} from "@/pages/api/api";


export const addFirstAid = async (data : Record<string,string>) => {
    try {
      const res = await api.post("inventory/firstaidlist/", {
        fa_name: toTitleCase(data.fa_name),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  