// import {api} from "@/pages/api/api";
// import { toTitleCase } from "../case";

// export const addMedicine = async (medicineName: string,cat_id:string) => {
//     try {
//       const res = await api.post("inventory/medicinelist/", {
//         med_name: toTitleCase(medicineName),
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//         cat: cat_id ? parseInt(cat_id, 10) : null,
//       });
  
//       return res.data;
//     } catch (err) {
//       console.log(err);
//     }
//   };