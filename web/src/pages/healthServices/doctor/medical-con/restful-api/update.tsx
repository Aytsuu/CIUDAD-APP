import { api2 } from "@/api/api";


export const updateChildHistoryStatus = async (
    chhist_id: string,
    status: string
  ) => {
    try {
      const response = await api2.patch(`child-health/update/history/${chhist_id}/`, {
        status: status,
      });

        if (!response.data) {
            throw new Error("Failed to update child health history status");
        }

        console.log("Child health history status updated successfully:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error updating medical history status:", error);
      throw error;
    }
  };
export const updateChildVitalSigns = async (
    chvital_id: string,
    find: string,
  ) => {
    try {
      const response = await api2.patch(`child-health/update/child-vitalsigns/${chvital_id}/`, { find });
      
      if (!response.data) {
        throw new Error("Failed to update child vital signs");
      }

      if (response.data.error) {
        throw new Error(`Bad Request: ${response.data.error}`);
      }

      console.log("Child vital signs updated successfully:", response.data);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        console.error("Bad Request:", error.response.data);
        throw new Error(`Bad Request: ${error.response.data.message || "Invalid data provided"}`);
      }
      console.error("Error updating child vital signs:", error);
      throw error;
    }
  };

  
  // Medical Consultation API
  export const updateMedicalConsultation = async (
    medrec_id: string,
    status: string,
    findingId?: number,
    medreq?: number,
    followv?: string
  ) => {
    try {
      const response = await api2.patch(
        `medical-consultation/update-medcon/${medrec_id}/`,
        {
          medrec_status: status,
          find: findingId || null,
          medreq: medreq,
          followv: Number(followv),
        }
      );
      if (!response.data) {
        throw new Error("Failed to update medical consultation record");
      }
        console.log("Medical consultation updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating medical consultation:", error);
      throw error;
    }
  };


export const updatePEOption = async (pe_option_id: number, text: string) => {
    try {
        const res = await api2.patch(`patientrecords/update-pe-option/${pe_option_id}/`, { text });
        if (res.data.error) {
            throw new Error(res.data.error);
        }
        console.log("PE option updated successfully:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error updating PE option:", err);
        throw err;
    }
};

