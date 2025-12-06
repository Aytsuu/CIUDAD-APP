import { api2 } from "@/api/api";

export const createMedicineRecord = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("/medicine/create-medicine-record/", data);
    if (process.env.NODE_ENV === 'development') {
      console.log("Medicine record created successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating medicine record:", error);
    }
    // Do not throw in production; only log in development
  }
};
