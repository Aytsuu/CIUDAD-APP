import { toTitleCase } from "../case";
import { api2 } from "@/api/api";


export const addFirstAid = async (firstAidName: string) => {
    try {
      const res = await api2.post("inventory/firstaidlist/", {
        fa_name: toTitleCase(firstAidName),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  