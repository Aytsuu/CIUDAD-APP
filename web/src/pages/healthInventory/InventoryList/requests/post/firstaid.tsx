import { toTitleCase } from "../case";
import { api } from "@/api/api";


export const addFirstAid = async (firstAidName: string) => {
    try {
      const res = await api.post("inventory/firstaidlist/", {
        fa_name: toTitleCase(firstAidName),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  