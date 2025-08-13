// restful-api/Firstaid/GetFirstaid.js
import {api2} from "@/api/api";

export const getFirstaidRecords = async () => {
  try {
    const response = await api2.get("/firstaid/all-firstaid-record/");
    return response.data;
  } catch (error) {
    console.error("Error fetching Firstaid records:", error);
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


