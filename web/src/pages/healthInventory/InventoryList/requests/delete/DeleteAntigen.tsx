
import {api} from "@/api/api";

export const handleDeleteVaccine = async (
    id: number,
    onSuccess: () => void
  ) => {
    try {
      const res = await api.delete(`inventory/vac_list/${id}`);
      if (res.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  



  export const handleDeleteAntigen = async (
    id: number,
    category: string,
  ) => {
    try {
      const endpoint = category === "Vaccine"
        ? `inventory/vac_list/${id}/`
        : `inventory/imz_supplies/${id}/`;
  
      const res = await api.delete(endpoint);
  
      if (res.status === 200 || res.status === 204) {
        console.log(`✅ deleted successfully!`);
      } else {
        console.error(res);
        throw new Error(`Failed to delete `);
      }
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error to handle it in the component
    }
  };