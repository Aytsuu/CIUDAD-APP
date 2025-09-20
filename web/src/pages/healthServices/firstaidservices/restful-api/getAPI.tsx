// restful-api/Firstaid/GetFirstaid.js
import {api2} from "@/api/api";

export const getFirstaidRecords = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.patient_type && params.patient_type !== "all") {
      queryParams.append("patient_type", params.patient_type);
    }

    const url = `/firstaid/all-firstaid-record/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
    const response = await api2.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching first aid records:", error);
    throw error;
  }
};

// export const getMedicatedCount = async () => {
//   try {
//     const response = await api.get("/Firstaid/Firstaid-records/medicated-count/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching medicated count:", error);
//     throw error;
//   }
// };

export const getFirstaidStocks = async () => {
  try {
    const response = await api2.get("/inventory/firstaidinventorylist/");
    console.log(response.data)

    return response.data;
  } catch (error) {
    console.error("Error fetching Firstaid stocks:", error);
    throw error;
  }
}


