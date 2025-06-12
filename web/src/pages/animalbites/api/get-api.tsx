import { api2 } from "@/api/api"
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitAnimalBiteReferral } from "../db-request/postrequest";



// Helper function for consistent error handling
const handleApiError = (err: any, operation: string) => {
  if (err.response) {
    console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}


export const getAnimalbitePatients = async () => {
  try {
    console.log("🔍 Fetching comprehensive animal bite patient records from /animalbites/patient-details/...");
    const res = await api2.get("animalbites/patient-details/"); // <--- Corrected API endpoint
    const allAnimalBiteRecords = res.data;

    console.log(`✅ Found ${allAnimalBiteRecords.length} comprehensive animal bite records.`);
    // console.log("Sample fetched data for overall:", allAnimalBiteRecords.slice(0, 2)); // Uncomment for debugging

    return allAnimalBiteRecords;
  } catch (error) {
    console.error("❌ Error fetching comprehensive animal bite patients:", error);
    handleApiError(error, "Fetch Animal Bite Patients (Comprehensive)");
    // Return an empty array or re-throw to allow error handling in React Query
    return [];
  }
};

// Fetch all animal bite patients (this function is intended to fetch a list of patients
// that can be selected in the referral form, so it fetches from patientrecords/patient/)
export const getAllPatients = async () => {
  try {
    const res = await api2.get("patientrecords/patient/")
    console.log("✅ Patients fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch All Patients")
    return []
  }
}

// Fetch all combined animal bite patient details (for overall.tsx and individual.tsx)
// This will fetch from the /animalbites/patient-details/ endpoint
export const getAnimalBitePatientDetails = async (patientId?: string) => {
  try {
    console.log(`🔍 Fetching animal bite patient details for patientId: ${patientId || 'all'}...`);
    const url = patientId 
      ? `animalbites/patient-details/?patient_id=${patientId}` 
      : "animalbites/patient-details/";
    const res = await api2.get(url);
    console.log("✅ Animal bite patient details fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Patient Details");
    return [];
  }
};

// This function is called by overall.tsx's useEffect. It now fetches combined data.
export const getAnimalbiteReferrals = async () => {
  return getAnimalBitePatientDetails(); 
};


// The following functions are assumed to be used elsewhere or might be needed for other operations
export const getAnimalbiteDetails = async () => {
  try {
    const res = await api2.get("animalbites/details/");
    console.log("✅ Animal bite details fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Details");
    return [];
  }
};

export const getUniqueAnimalbitePatients = async () => {
  try {
    console.log("🔍 Fetching unique animal bite patients...");
    // This function might need to be adjusted or removed if getAnimalBitePatientDetails
    // with client-side aggregation in overall.tsx covers its functionality.
    // For now, assuming it's for something specific if not handled by getAnimalBitePatientDetails.
    const res = await api2.get("animalbites/unique-patients/"); // This endpoint doesn't exist yet, just a placeholder.
    console.log("✅ Unique animal bite patients fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Fetch Unique Animal Bite Patients");
    return [];
  }
};


// Fetch a single patient by ID (for pre-filling form if needed)
export const getPatientById = async (patientId: string) => {
  try {
    console.log(`🔍 Fetching patient with ID: ${patientId}...`);
    const res = await api2.get(`patientrecords/patient/${patientId}/`);
    console.log("✅ Patient fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, `Fetch Patient by ID: ${patientId}`);
    return null;
  }
};


// Create a patient (if the flow allows creating a patient from this section)
export const createPatient = async (patientData: any) => {
  try {
    console.log("📝 Creating new patient:", patientData);
    const res = await api2.post("patientrecords/patient/", patientData);
    console.log("✅ Patient created successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Create Patient");
    return null;
  }
};

// Update an existing patient
export const updatePatient = async (patientId: string, patientData: any) => {
  try {
    console.log(`📝 Updating patient with ID: ${patientId}`, patientData);
    const res = await api2.put(`patientrecords/patient/${patientId}/`, patientData);
    console.log("✅ Patient updated successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Update Patient");
    return null;
  }
};

// Delete a patient
export const deletePatient = async (patientId: string) => {
  try {
    console.log(`🗑️ Deleting patient with ID: ${patientId}`);
    await api2.delete(`patientrecords/patient/${patientId}/`);
    console.log("✅ Patient deleted successfully");
    return true;
  } catch (error) {
    handleApiError(error, "Delete Patient");
    return false;
  }
};

// Create a patient record (if this is a separate step)
export const createPatientRecord = async (recordData: any) => {
  try {
    console.log("📝 Creating new patient record:", recordData);
    const res = await api2.post("patientrecords/patient-record/", recordData);
    console.log("✅ Patient record created successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, "Create Patient Record");
    return null;
  }
};

export const getPatientRecordsByPatId = async (patId: string) => {
  try {
    // This function will now fetch from animalbites/patient-details/ with a filter
    const res = await api2.get(`animalbites/patient-details/?patient_id=${patId}`);
    console.log("✅ Patient records by pat_id fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Pat ID: ${patId}`);
    return [];
  }
};

export const getPatientRecordsByReferralId = async (referralId: string) => {
  try {
    // This is for fetching records specifically by referral ID if needed.
    // The current flow mostly uses patient ID or overall records.
    const res = await api2.get(`animalbites/referral/${referralId}/`); // Assuming an endpoint exists for this.
    console.log("✅ Patient records by referral ID fetched successfully:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Referral ID: ${referralId}`);
    return [];
  }
};