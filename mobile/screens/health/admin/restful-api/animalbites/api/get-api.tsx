import { api2 } from "@/api/api"

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
    const res = await api2.get("animalbites/patient-details/");
    const allAnimalBiteRecords = res.data;
    console.log(`✅ Found ${allAnimalBiteRecords.length} comprehensive animal bite records.`);
    return allAnimalBiteRecords;
  } catch (error) {
    console.error("❌ Error fetching comprehensive animal bite patients:", error);
    handleApiError(error, "Fetch Animal Bite Patients (Comprehensive)");
    return [];
  }
};
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

// export const getAnimalBitePatientDetails = async (patientId?: string) => {
//   try {
//     console.log(`🔍 Fetching animal bite patient details for patientId: ${patientId || "all"}...`)
//     const url = patientId ? `animalbites/patient-details/?patient_id=${patientId}` : "animalbites/patient-details/"

//     const res = await api2.get(url)
//     console.log(`✅ Animal bite patient details fetched successfully: ${res.data.length} records`)
//     return res.data
//   } catch (error: any) {
//     console.error("❌ Error fetching animal bite patient details:", error)
//     console.error("Response data:", error.response?.data)
//     console.error("Status:", error.response?.status)

//     // More detailed error handling
//     if (error.response?.status === 500) {
//       console.error("Server error - check Django logs for details")
//     }

//     handleApiError(error, "Fetch Animal Bite Patient Details")
//     return []
//   }
// }

export const getAnimalBitePatientDetails = async () => {
    try {
        const res = await api2.get('animalbites/patient-details/')
        return res.data
    } catch (error) {
        handleApiError(error, 'Fetch Animal Bite Patient Details')
        return []
    }
}

export const getAnimalbiteReferrals = async () => {
  return getAnimalBitePatientDetails()
}

export const getAnimalbiteDetails = async () => {
  try {
    const res = await api2.get("animalbites/details/")
    console.log("✅ Animal bite details fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Details")
    return []
  }
}

export const getUniqueAnimalbitePatients = async () => {
  try {
    console.log("🔍 Fetching unique animal bite patient counts from /animalbites/patient-record-counts/...");
    const res = await api2.get('animalbites/patient-record-counts/');
    console.log(`✅ Found ${res.data.length} unique animal bite patients with counts.`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching unique animal bite patients:", error);
    handleApiError(error, 'Fetch Unique Animal Bite Patients');
    return [];
  }
};

export const getPatientById = async (patientId: string) => {
  try {
    console.log(`🔍 Fetching patient with ID: ${patientId}...`)
    const res = await api2.get(`patientrecords/patient/${patientId}/`)
    console.log("✅ Patient fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, `Fetch Patient by ID: ${patientId}`)
    return null
  }
}

export const createPatient = async (patientData: any) => {
  try {
    console.log("📝 Creating new patient:", patientData)
    const res = await api2.post("patientrecords/patient/", patientData)
    console.log("✅ Patient created successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Create Patient")
    return null
  }
}


export const createPatientRecord = async (recordData: any) => {
  try {
    console.log("📝 Creating new patient record:", recordData)
    const res = await api2.post("patientrecords/patient-record/", recordData)
    console.log("✅ Patient record created successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Create Patient Record")
    return null
  }
}

export const getPatientRecordsByPatId = async (patId: string) => {
  try {
    // This function will now fetch from animalbites/patient-details/ with a filter
    const res = await api2.get(`animalbites/patient-details/?patient_id=${patId}`)
    console.log("✅ Patient records by pat_id fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Pat ID: ${patId}`)
    return []
  }
}

export const getPatientRecordsByReferralId = async (referralId: string) => {
  try {
    const res = await api2.get(`animalbites/referral/${referralId}/`) // Assuming an endpoint exists for this.
    console.log("✅ Patient records by referral ID fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Referral ID: ${referralId}`)
    return []
  }
}