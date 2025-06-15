
// import { api } from "@/api/api"

// export const  getMedicineStocks = async()=>{
//     try{
//       const res= await api.get("inventory/medicineinventorylist/")
//       if(res.status==200){
//         return res.data;
//       }
//       console.error(res.status)
//       return[]
//     }catch(err){
//       console.log(err)
//       return[]
//     }
//   }


//   export const  getCommodityStocks = async()=>{
//     try{
//       const res= await api.get("inventory/commodityinventorylist/")
//       if(res.status==200){
//         return res.data;
//       }
//       console.error(res.status)
//       return[]
//     }catch(err){
//       console.log(err)
//       return[]
//     }
//   }
  
//   export const  getFirstAidStocks = async()=>{
//     try{
//       const res= await api.get("inventory/firstaidinventorylist/")
//       if(res.status==200){
//         return res.data;
//       }
//       console.error(res.status)
//       return[]
//     }catch(err){
//       console.log(err)
//       return[]
//     }
//   }




//   export const getVaccine = async () => {
//     try {
//       const res = await api.get("inventory/vac_list/");
//       if (res.status === 200) {
//         // Transform the data to match your SelectLayout options format
//         return res.data.map((vaccine: any) => ({
//           id: vaccine.vac_id.toString(),
//           name: vaccine.vac_name,
//           // Include other fields you might need
//           type: vaccine.vac_type_choices,
//           categoryId: vaccine.vaccat_id
//         }));
//       }
//       console.error(res.status);
//       return [];
//     } catch (err) {
//       console.log(err);
//       return [];
//     }
//   };

  
//   export const getSupplies = async () => {
//     try {
//       const res = await api.get("inventory/imz_supplies/");
//       if (res.status === 200) {
//         // Transform the data to match your SelectLayout options format
//         return res.data.map((supplies: any) => ({
//           id: supplies.imz_id.toString(),
//           name: supplies.imz_name,
//           // Include other fields you might need
//           type: supplies.vac_type_choices,
//           categoryId: supplies.vaccat_id
//         }));
//       }
//       console.error(res.status);
//       return [];
//     } catch (err) {
//       console.log(err);
//       return [];
//     }
//   };