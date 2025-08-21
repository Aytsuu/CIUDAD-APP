// restful-api/Medicine/GetMedicine.js
import {api2} from "@/api/api";

export const getMedicineRecords = async () => {
  try {
    const response = await api2.get("/medicine/all-medicine-records/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};



// export const getMedicineRecords = async (
//   search?: string,
//   page?: number,
//   pageSize?: number,
//   exportAll?: boolean
// ): Promise<any> => {
//   try {
//     const response = await api2.get<any>(
//       "/medicine/all-medicine-records/",
//       { 
//         params: { 
//           search: search || undefined,
//           page: exportAll ? undefined : page,
//           page_size: exportAll ? undefined : pageSize,
//           export: exportAll ? 'true' : undefined
//         } 
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching medicine records:", error);
//     throw error;
//   }
// };




export const getMedicineStocks = async () => {
  try {
    const response = await api2.get("/inventory/medicineinventorylist/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine stocks:", error);
    throw error;
  }
}


