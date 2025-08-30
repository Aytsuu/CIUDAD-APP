import { api2 } from "@/api/api";

export const createchildSoapForm = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("medical-consultation/create-soap-form/childhealth/", data);
    if (!response.data?.chsoap_id) {
      throw new Error("Failed to retrieve the SOAP ID from the response");
    }
    console.log("Child SOAP form created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating child SOAP form:", error);
    throw error;
  }
};
