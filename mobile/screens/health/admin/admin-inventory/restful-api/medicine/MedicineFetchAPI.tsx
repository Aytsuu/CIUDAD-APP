import {api2} from "@/api/api";

// export const getMedicines = async () => {
//     try {
//       const res = await api2.get("inventory/medicinelist/");
//       if (res.status === 200) { 
//         return res.data;
//       }
//       console.error(res.status);
//       return [];
//     } catch (error) {
//       console.error(error);
//       return [];
//     }
//   };
  
  export const getMedicines = async () => {
    try {
      const res = await api2.get("inventory/medicineinventorylist/"); // Corrected endpoint
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