// // REQUEST/Archive/ArchivePutAPI.ts
// import { api2 } from "@/api/api";

// export const archiveInventory = async (inv_id: string, isExpired: boolean = false, hasAvailableStock: boolean = false) => {
//   try {
//     const response = await api2.put(`inventory/antigen/${inv_id}/`, {
//       is_expired: isExpired,
//       has_available_stock: hasAvailableStock
//     });

//     return response.data;
//   } catch (error) {
//     console.error("Error archiving inventory:", error);
//     throw error;
//   }
// };