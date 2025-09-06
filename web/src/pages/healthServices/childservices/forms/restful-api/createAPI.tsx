import { api2 } from "@/api/api";

export async function createChildHealthHistory(data: Record<string, any>) {
  try {
    const response = await api2.post("child-health/history/", data);
    if (!response.data.chhist_id) {
      throw new Error("Failed to create child health history: No ID returned");
    }
    console.log("Child health history created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating child health history:", error);
    throw new Error(`Failed to create child health history: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function createChildHealthRecord(data: Record<string, any>) {
  try {
    const response = await api2.post("child-health/records/", data);
    if (!response.data.chrec_id) {
      throw new Error("Failed to create child health record: No ID returned");
    }
    console.log("Child health record created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating child health record:", error);
    throw new Error(`Failed to create child health record: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// --- Supplement Status (Anemic, Birth Weight) Operations ---

export async function createSupplementStatus(data: Record<string, any>) {
  try {
    const response = await api2.post("child-health/supplement-status/", data);
    console.log(`New ${data.status_type} status created:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error creating ${data.status_type} status:`, error);
    throw new Error(`Failed to create ${data.status_type} status: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function createExclusiveBFCheck(data: Record<string, any>) {
  try {
    const response = await api2.post("child-health/exclusive-bf-check/", data);
    console.log("Exclusive BF check created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Exclusive BF check creation error:", error);
    throw new Error(`Failed to create exclusive breastfeeding check: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// --- Nutritional Status Operations ---
export const createNutritionalStatus = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("child-health/nutritional-status/", data);
    if (!response.data.nutstat_id) {
      throw new Error("Failed to create nutritional status record: No ID returned");
    }
    console.log("Nutritional status record created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Nutritional status creation error:", error);
    throw new Error(`Failed to create nutritional status: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// --- Child Vital Signs Operations ---
export const createChildVitalSign = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("child-health/child-vitalsigns/", data);
    if (!response.data.chvital_id) {
      throw new Error("Failed to create vital signs record: No ID returned");
    }
    console.log("Vital signs record created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Vital signs creation error:", error);
    throw new Error(`Failed to create vital signs record: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

export const createChildHealthNotes = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("child-health/notes/", data);
    if (!response.data.chnotes_id) {
      throw new Error("Failed to create child health notes: No ID returned");
    }
    console.log("Child health notes created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating child health notes:", error);
    throw new Error(`Failed to create child health notes: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// --- Body Measurement Operations ---
export const createBodyMeasurement = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/body-measurements/", data);
    if (!response.data.bm_id) {
      throw new Error("Failed to create BMI record: No ID returned");
    }
    console.log("BMI record created:", response.data);
    return response.data;
  } catch (error) {
    console.error("BMI record creation error:", error);
    throw new Error(`Failed to create BMI record: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// --- Patient Disability Operations ---
export const createPatientDisability = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/patient-disability/", data);
    console.log("Disabilities linked:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to link disabilities:", error);
    throw new Error(`Failed to link disabilities: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// --- Follow-up Visit Operations ---
export const createFollowUpVisit = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", data);
    if (!response.data.followv_id) {
      throw new Error("Failed to create follow-up record: No ID returned");
    }
    console.log("Follow-up visit created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Follow-up visit creation error:", error);
    throw new Error(`Failed to create follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// --- Child Medicine Record Operations ---
export const processMedicineRequest = async (data: Record<string, any>): Promise<any> => {
  try {
    console.log("Sending data to /inventory/childmedicine/:", data);
    const res = await api2.post("/inventory/childmedicine/", data);
    if (!res.data || !res.data.results || !Array.isArray(res.data.results)) {
      throw new Error("Failed to create child medicine record: Missing or invalid response data");
    }
    
    console.log("Response from /inventory/childmedicine/:", res.data);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.error("Bad request error:", error.response.data);
      throw new Error(`Bad request: ${JSON.stringify(error.response.data)}`);
    }
    console.error("Error creating child medicine record:", error);
    throw new Error(`Failed to create child medicine record: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};