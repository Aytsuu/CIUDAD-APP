// restful-api/Medicine/GetMedicine.js
import {api} from "@/api/api";

export const getMedicineRecords = async () => {
  try {
    const response = await api.get("/medicine/all-medicine-records/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};

// export const getMedicatedCount = async () => {
//   try {
//     const response = await api.get("/medicine/medicine-records/medicated-count/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching medicated count:", error);
//     throw error;
//   }
// };

export const getMedicineStocks = async () => {
  try {
    const response = await api.get("/inventory/medicineinventorylist/");
    console.log(response.data)

    return response.data;
  } catch (error) {
    console.error("Error fetching medicine stocks:", error);
    throw error;
  }
}