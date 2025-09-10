// restful-api/Medicine/GetMedicine.js
import {api2} from "@/api/api";




// API function to get individual medicine records with pagination
export const getIndividualMedicineRecords = async (
  pat_id: string,
  page: number,
  pageSize: number,
  search?: string
): Promise<any> => {
  try {
    const response = await api2.get(`/medicine/medicine-records-table/${pat_id}/`, {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined
      }
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};

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


