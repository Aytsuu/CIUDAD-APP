// import {api} from "@/pages/api/api";
// import {MedicineStockType, InventoryType, VaccineStockType, AntigenTransactionType } from "../REQUEST/type";

// import { log } from "console";


// // import { CommodityStockType } from "../REQUEST/type";
// // // medicine inventory details
// // export const addMedicineInventory = async (medicineData: MedicineStockType) => {
// //   try {
// //     const res = await api.post(
// //       medicineData
// //     );
// //     return res.data;
// //   } catch (err: any) {
// //     console.log("Error response:", err.response?.data || err.message);
// //     throw err;
// //   }
// // };


// // export const  addFirstAidInventory = async (firstAidData: FirstAidStockType) => {
// //   try {
// //     const res = await api.post(
// //       "inventory/firstaidinventorylist/",
// //       firstAidData
// //     );
// //     return res.data;
// //   } catch (err: any) {
// //     console.log("Error response:", err.response?.data || err.message);
// //     throw err;
// //   }
// // }

// // export const addInventory = async (inventoryData: InventoryType) => {
// //   try {
// //     console.log("Sending payload:", inventoryData); // Log the payload
// //     const res = await api.post("inventory/inventorylist/", inventoryData);
// //     return res.data;
// //   } catch (err: any) {
// //     console.log("Error response:", err.response?.data || err.message);
// //     throw err;
// //   }
// // };
 
// // // add stocks for medicine
// // export const addMedicineTransaction = async (MedTransactindata: MedicineTransactionType) => {
// //   try {
// //     const res = await api.post("inventory/medicinetransaction/",MedTransactindata);
// //     return res.data;
// //   } catch (err:any) {
// //     console.log("Error response:", err.response?.data || err.message);
// //     throw err;
// //   }
// // };

// // // add stocks for medicine
// // export const addFirstAidTransaction = async (FirstAidTransacindata: FirstAidTransactionType) => {
// //   try {
// //     const res = await api.post("inventory/firstaidtransaction/",FirstAidTransacindata);
// //     return res.data;
// //   } catch (err:any) {
// //     console.log("Error response:", err.response?.data || err.message);
// //     throw err;
// //   }
// // };



// // REQUEST/Post.ts
// // REQUEST/Post.ts
// // export const addVaccineStock = async (vaccineStockData: VaccineStockType, vac_id: number, inv_id: number) => {
// //   // Calculate available quantity based on solvent type
// //   const availqty = vaccineStockData.solvent === 'doses' 
// //     ? vaccineStockData.qty * (vaccineStockData.volume || 0) 
// //     : vaccineStockData.qty;

// //   try {
// //     const payload = {
// //       inv_id: inv_id,
// //       vac_id: vac_id,
// //       batch_number: vaccineStockData.batchNumber,
// //       solvent: vaccineStockData.solvent,
// //       volume: vaccineStockData.volume || 0,
// //       qty: vaccineStockData.qty,
// //       dose_ml: vaccineStockData.volume || 0,
// //       vacStck_qty_avail: availqty,  // Use the calculated available quantity
// //       wasted_dose: 0,  // Initialize wasted doses to 0
// //       expiry_date: vaccineStockData.expiryDate,
// //       created_at: new Date().toISOString(),
// //       updated_at: new Date().toISOString(),
// //     };

// //     const res = await api.post("inventory/vaccine_stocks/", payload);
// //     return res.data;
// //   } catch (err) {
// //     console.error(err);
// //     throw err;
// //   }
// // };






// export const AntigenTransaction = async (AntigenData: AntigenTransactionType ) => {
//   try {
//     const res = await api.post("inventory/antigens_stocks/",AntigenData);
//     return res.data;
//   } catch (err:any) {
//     console.log("Error response:", err.response?.data || err.message);
//     throw err;
//   }
// };


