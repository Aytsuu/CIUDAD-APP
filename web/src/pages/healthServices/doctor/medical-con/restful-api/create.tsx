import { api2 } from "@/api/api";



// SOAPFORM
export const createMedicalConsultationSoapForm = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("medical-consultation/create-soap-form/", data);
   
    console.log("Medical consultation SOAP form created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating medical consultation SOAP form:", error);
    throw error;
  }
}



// Findings API
export const createFindings = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/findings/", data);
    if (!response.data?.find_id) {
      throw new Error("Failed to retrieve the finding ID from the response");
    }
    console.log("Finding created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating findings:", error);
    throw error;
  }
};

// Medical History API
export const createMedicalHistory = async (
  data: Array<{ [key: string]: any }>
) => {
  try {
    await api2.post("patientrecords/medical-history/", data);
    console.log("Medical history created successfully");
    return true;
  } catch (error) {
    console.error("Error creating medical history:", error);
    throw error;
  }
};

export const createFollowUpVisit = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", data);
    if (!response.data?.followv_id) {
      throw new Error(
        "Failed to retrieve the follow-up visit ID from the response"
      );
    }
    console.log("Follow-up visit created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createFindingPlantreatment = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("medicine/findings-plan-treatment/", data);
    if (!res.data?.fpt_id) {
      throw new Error(
        "Failed to retrieve the finding plantreatment ID from the response"
      );
    }
    console.log("Finding plantreatment created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error creating finding plantreatment:", error);
    throw error;
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
      throw new Error("Patient ID must be provided");
    }

    // Validate medicines exist
    if (!data.medicines || !Array.isArray(data.medicines) || data.medicines.length === 0) {
      throw new Error("At least one medicine is required");
    }

    const response = await api2.post("medicine/medicine-request/", {
      pat_id: data.pat_id,
      rp_id: data.rp_id || null,
      medicines: data.medicines.map((med: Record<string, any>) => ({
        minv_id: med.minv_id,
        medreqitem_qty: med.medreqitem_qty,
        reason: med.reason || "No reason provided",
      })),
    });

    if (!response.data?.medreq_id) {
      throw new Error(
        "Failed to retrieve the medicine request ID from the response"
      );
    }
    console.log("Medicine request created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating medicine request:", error);
    throw error;
  }
};

export const createPEResults = async (
  selectedOptionIds: number[],
  find: number
) => {
  try {
    // Send the IDs directly as an array
    const res = await api2.post("patientrecords/pe-result/", {
      pe_option: selectedOptionIds,
      find: find,
    });
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    console.log("Physical exam results saved successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error saving physical exam results:", err);
    throw err;
  }
};

export const createPEOption = async (pe_section_id: number, text: string) => {
  try {
    const res = await api2.post(`patientrecords/pe-option/`, {
      pe_section: pe_section_id,
      text,
    });
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    console.log("PE option created successfully:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error creating PE option:", err);
    throw err;
  }
};
