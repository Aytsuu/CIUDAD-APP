import { api2 } from "@/api/api";

export const createFirstaidRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("/firstaid/create-firstaid-record/", data);
    if (process.env.NODE_ENV === 'development') {
      console.log("firstaid Record Response:", response.data); // Debugging log
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating firstaid record:", error);
    }
    return null;
  }
};

