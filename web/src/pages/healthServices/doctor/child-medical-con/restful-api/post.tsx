import { api2 } from "@/api/api";

export const createchildSoapForm = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("medical-consultation/create-soap-form/childhealth/", data);
    if (!response.data ) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to retrieve the SOAP ID from the response", response);
      return null;
    }

    return response.data; // Return the response data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error("Error creating child SOAP form:", error);
    return null;
  }
};
