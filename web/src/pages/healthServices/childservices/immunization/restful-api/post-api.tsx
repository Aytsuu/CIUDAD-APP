import { api2 } from "@/api/api";
export const createimmunizationRecord = async (data: any) => {
    const response = await api2.post(
      "/child-health/immunization-history/", data
    );
    return response.data; // Return the created record data
  
};
