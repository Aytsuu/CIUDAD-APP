import {api} from "@/api/api";

export const getMedicines = async () => {
    try {
      const res = await api.get("inventory/medicinelist/");
      if (res.status === 200) { 
        return res.data;
      }
      console.error(res.status);
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  