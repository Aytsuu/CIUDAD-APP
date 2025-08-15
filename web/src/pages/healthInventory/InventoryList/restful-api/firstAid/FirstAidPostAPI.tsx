import { toTitleCase } from "@/helpers/ToTitleCase";
import {api2} from "@/api/api";


export const addFirstAid = async (data : Record<string,string>) => {
    try {
      const res = await api2.post("inventory/firstaidlist/", {
        fa_name: toTitleCase(data.fa_name),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        staff:data.staff_id
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  