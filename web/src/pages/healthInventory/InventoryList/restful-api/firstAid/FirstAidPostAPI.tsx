import { toTitleCase } from "@/helpers/ToTitleCase";
import {api2} from "@/api/api";


export const addFirstAid = async (data : Record<string,string>,staff_id:string) => {
    try {
      const res = await api2.post("inventory/firstaidlist/", {
        fa_name: toTitleCase(data.fa_name),
        cat: data.cat_id ? parseInt(data.cat_id, 10) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        staff:staff_id||null
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  