
import api from "@/pages/api/api";

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
    type: "vaccine" | "supplies",
  ) => {
    try {
      const endpoint = type === "vaccine"
        ? `inventory/vac_list/${id}/`
        : `inventory/imz_supplies/${id}/`;
  
      const res = await api.delete(endpoint);
  
      if (res.status === 200 || res.status === 204) {
        console.log(`✅ ${type === "vaccine" ? "Vaccine" : "Immunization supply"} deleted successfully!`);
  
        // Option 1: Update local state directly
        
        // Option 2: Invalidate query to refetch data
      } else {
        console.error(res);
        throw new Error(`Failed to delete ${type}`);
      }
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error to handle it in the component
    }
  };