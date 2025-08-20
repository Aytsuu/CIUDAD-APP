
import {api2} from "@/api/api";

// export const handleDeleteVaccine = async (
//     id: number,
//     onSuccess: () => void
//   ) => {
//     try {
//       const res = await api2.delete(`inventory/vac_list/${id}`);
//       if (res.status === 200) {
//         onSuccess();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };
  
  



  export const handleDeleteAntigen = async (
    id: number,
    category: string,
  ) => {
    try {
      const endpoint = category === "Vaccine"
        ? `inventory/vac_list/${id}/`
        : `inventory/imz_supplies/${id}/`;
  
      const res = await api2.delete(endpoint);
      return res.data
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error to handle it in the component
    }
  };