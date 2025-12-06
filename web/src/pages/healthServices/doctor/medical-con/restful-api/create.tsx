import { api2 } from "@/api/api";

// SOAPFORM
export const createMedicalConsultationSoapForm = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("medical-consultation/create-soap-form/", data);
    if (process.env.NODE_ENV === 'development') {
      console.log("Medical consultation SOAP form created successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating medical consultation SOAP form:", error);
    }
    return null;
  }
};

// Findings API
export const createFindings = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/findings/", data);
    if (!response.data?.find_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to retrieve the finding ID from the response");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Finding created successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating findings:", error);
    }
    return null;
  }
};

// Medical History API
export const createMedicalHistory = async (data: Array<{ [key: string]: any }>) => {
  try {
    await api2.post("patientrecords/medical-history/", data);
    if (process.env.NODE_ENV === 'development') {
      console.log("Medical history created successfully");
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating medical history:", error);
    }
    return null;
  }
};

export const createFollowUpVisit = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", data);
    if (!response.data?.followv_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to retrieve the follow-up visit ID from the response");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Follow-up visit created successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    return null;
  }
};

export const createFindingPlantreatment = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("medicine/findings-plan-treatment/", data);
    if (!res.data?.fpt_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to retrieve the finding plantreatment ID from the response");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Finding plantreatment created successfully:", res.data);
    }
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating finding plantreatment:", error);
    }
    return null;
  }
};

// pat_id: formData.medicineRequest.pat_id,
// medicines: formData.medicineRequest.medicines.map((med) => ({
//   minv_id: med.minv_id,
//   medrec_qty: med.medrec_qty,
//   reason: med.reason || "No reason provided",
export const createMedicineRequest = async (data: Record<string, any>) => {
  try {
    // Validate at least one ID is provided
    if (!data.pat_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Patient ID must be provided");
      }
      return null;
    }

    // Validate medicines exist
    if (!data.medicines || !Array.isArray(data.medicines) || data.medicines.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.error("At least one medicine is required");
      }
      return null;
    }

    const response = await api2.post("medicine/medicine-request/", {
      pat_id: data.pat_id,
      rp_id: data.rp_id || null,
      medicines: data.medicines.map((med: Record<string, any>) => ({
        minv_id: med.minv_id,
        medreqitem_qty: med.medreqitem_qty,
        reason: med.reason || "No reason provided"
      }))
    });

    if (!response.data?.medreq_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to retrieve the medicine request ID from the response");
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Medicine request created successfully:", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating medicine request:", error);
    }
    return null;
  }
};

export const createPEResults = async (selectedOptionIds: number[], find: number) => {
  try {
    // Send the IDs directly as an array
    const res = await api2.post("patientrecords/pe-result/", {
      pe_option: selectedOptionIds,
      find: find
    });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("Physical exam results saved successfully:", res.data);
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error saving physical exam results:", err);
    }
    return null;
  }
};

export const createPEOption = async (pe_section_id: number, text: string) => {
  try {
    const res = await api2.post(`patientrecords/pe-option/`, {
      pe_section: pe_section_id,
      text
    });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log("PE option created successfully:", res.data);
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating PE option:", err);
    }
    return null;
  }
};
