import {api} from "@/pages/api/api";


const toTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const updateMedicine = async (med_id: number, medicineName: string) => {
  
    try {
      const res = await api.put(`inventory/update_medicinelist/${med_id}/`, {
        med_name: toTitleCase(medicineName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to handle it in the calling function
    }
  };


  export const updateFirstAid = async (fa_id: number, firstAidName: string) => {
  
    try {
      const res = await api.put(`inventory/update_firstaidlist/${fa_id}/`, {
        fa_name: toTitleCase(firstAidName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

  export const updateCommodity = async (com_id: number, comName: string) => {
  
    try {
      const res = await api.put(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(comName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };