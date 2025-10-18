import { api2 } from "@/api/api"

const handleApiError = (err: any, operation: string) => {
  if (err.response) {
    console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}

export const getAnimalBitePatientSummary = async () => {
  try {
    console.log("🔍 Fetching unique animal bite patient summary from /animalbites/patient-summary/...")
    const res = await api2.get("animalbites/patient-details/")
     console.log("API Response:", res.data) // Add this line
    const uniquePatients = res.data

    console.log(`✅ Found ${uniquePatients.length} unique animal bite patients.`)

    // Check for duplicates in the response
    const patientIds = uniquePatients.map((p: any) => p.patient_id)
    const uniqueIds = [...new Set(patientIds)]

    if (patientIds.length !== uniqueIds.length) {
      console.warn("⚠️ Backend still returning duplicates:", patientIds.length, "vs", uniqueIds.length)

      // Remove duplicates on frontend as fallback
      const uniquePatientsMap = new Map()
      uniquePatients.forEach((patient: any) => {
        if (!uniquePatientsMap.has(patient.patient_id)) {
          uniquePatientsMap.set(patient.patient_id, patient)
        }
      })
      const deduplicatedPatients = Array.from(uniquePatientsMap.values())
      console.log(`✅ Deduplicated to ${deduplicatedPatients.length} unique patients.`)
      return deduplicatedPatients
    }

    return uniquePatients
  } catch (error) {
    console.error("❌ Error fetching unique animal bite patients:", error)
    handleApiError(error, "Fetch Unique Animal Bite Patients")
    return []
  }
}

export const getAnimalBitePatientCounts = async () => {
  try {
    console.log("🔍 Fetching aggregated animal bite patient records from /animalbites/patient-record-counts/...")
    const res = await api2.get("animalbites/patient-record-counts/") // Changed endpoint
    const aggregatedRecords = res.data

    console.log(`✅ Found ${aggregatedRecords.length} unique animal bite patient records.`)

    return aggregatedRecords
  } catch (error) {
    console.error("❌ Error fetching aggregated animal bite patients:", error)
    handleApiError(error, "Fetch Aggregated Animal Bite Patients")
    return []
  }
}

export const getAnimalbitePatients = async () => {
  try {
    console.log("🔍 Fetching comprehensive animal bite patient records from /animalbites/patient-details/...")
    const res = await api2.get("animalbites/patient-details/")
    const allAnimalBiteRecords = res.data
    console.log(`✅ Found ${allAnimalBiteRecords.length} comprehensive animal bite records.`)
    return allAnimalBiteRecords
  } catch (error) {
    console.error("❌ Error fetching comprehensive animal bite patients:", error)
    handleApiError(error, "Fetch Animal Bite Patients (Comprehensive)")
    return []
  }
}

export const getAllPatients = async () => {
  try {
    const res = await api2.get("patientrecords/patient/create/view")
    console.log("✅ Patients fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch All Patients")
    return []
  }
}

export const getAnimalBitePatientDetails = async () => {
  try {
    const res = await api2.get("animalbites/patient-details/")
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Patient Details")
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
    console.log("🔍 Fetching unique animal bite patients from /animalbites/patient-summary/...")
    const res = await api2.get("animalbites/patient-summary/")
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Unique Animal Bite Patients")
    return []
  }
}

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
    const res = await api2.post("patientrecords/patient/create/view", patientData)
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
    const res = await api2.get(`animalbites/patient-details/${patId}/`)
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
    return res.data
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Referral ID: ${referralId}`)
    return []
  }
}

export const getPatientByResidentId = async (rpId: string) => {
  try {
    const res = await api2.get(`patientrecords/patient/by-resident/${rpId}/`);
    return res.data;
  } catch (error) {
    handleApiError(error, `Fetch Patient by Resident ID: ${rpId}`);
    return null;
  }
};
