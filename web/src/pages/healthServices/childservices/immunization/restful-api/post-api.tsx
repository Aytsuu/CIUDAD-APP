import { api2 } from "@/api/api";
export const createimmunizationRecord = async (data: any) => {
  try {
    const response = await api2.post(
      "/child-health/immunization-history/", data
    );
    return response.data; // Return the created record data
  } catch (error) {
    console.error("Error creating immunization record:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};