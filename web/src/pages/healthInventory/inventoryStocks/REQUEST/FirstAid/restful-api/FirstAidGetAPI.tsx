import {api} from "@/api/api";


export const getFirstAidInventoryList = async () => {
    try {
      const res = await api.get("inventory/firstaidinventorylist/");
      return res.data || [];
    } catch (err) {
      console.error(err)
  }
  };


  

  