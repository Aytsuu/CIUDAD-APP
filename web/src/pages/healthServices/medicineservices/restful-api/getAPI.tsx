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

export const getMedicineRecords = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.patient_type && params.patient_type !== "all") {
      queryParams.append("patient_type", params.patient_type);
    }

    const url = `/medicine/all-medicine-records/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const response = await api2.get(url);
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


