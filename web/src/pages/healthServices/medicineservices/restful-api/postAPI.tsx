import { api2 } from "@/api/api";

export const createMedicineRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("/medicine/create-medicine-record/", data);
    console.log("Medicine record created successfully:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("Error creating medicine record:", error);
    throw error;
  }
};
