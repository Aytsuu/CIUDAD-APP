import { api2 } from "@/api/api";

export const updateChildHistoryStatus = async (data: Record<string, any>) => {
  try {
    const response = await api2.patch(`child-health/update/history/${data.chhist_id}/`, data);
    if (!response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update child health history status");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Child health history status updated successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating medical history status:", error);
    }
    return null;
  }
};
export const updateChildVitalSigns = async (data: Record<string, any>) => {
  try {
    const response = await api2.patch(`child-health/update/child-vitalsigns/${data.chvital_id}/`, data);
    if (!response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update child vital signs");
      }
      return null;
    }
    if (response.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Bad Request: ${response.data.error}`);
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Child vital signs updated successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating child vital signs:", error);
    }
    return null;
  }
};

// Medical Consultation API
export const updateMedicalConsultation = async (data: Record<string, any>) => {
  try {
    const response = await api2.patch(`medical-consultation/update-medcon/${data.medrec_id}/`, data);
    if (!response.data) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update medical consultation record");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Medical consultation updated successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating medical consultation:", error);
    }
    return null;
  }
};

export const updatePEOption = async (pe_option_id: number, text: string) => {
  try {
    const res = await api2.patch(`patientrecords/update-pe-option/${pe_option_id}/`, { text });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("PE option updated successfully:", res.data);
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating PE option:", err);
    }
    return null;
  }
};
