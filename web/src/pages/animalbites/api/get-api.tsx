// get-api.tsx
import { api2 } from "@/api/api"

const handleApiError = (err: any, operation: string) => {
  if (err.response) {
    console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}

export interface AnimalBiteAnalytics {
  totalCases: number;
  biteCases: number;
  nonBiteCases: number;
  mostCommonAnimal: string;
  mostCommonSite: string;
  monthlyAverage: number;
  monthlyTrends: Array<{ month: string; cases: number; bites: number }>;
  animalTypes: Array<{ animal: string; count: number }>;
  exposureTypes: Array<{ name: string; value: number }>;
  patientTypes: Array<{ name: string; value: number }>;
  exposureSites: Array<{ site: string; count: number }>;
  recentCases: Array<{ date: string; patient: string; animal: string; exposure_type: string }>;
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
    const res = await api2.get("patientrecords/patients/")
    console.log("✅ Patients fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch All Patients")
    return []
  }
}

export const getAnimalBitePatientDetails = async (patientId?: string) => {
  try {
    console.log(`🔍 Fetching animal bite patient details for patientId: ${patientId || "all"}...`)
    const url = patientId ? `animalbites/patient-details/?patient_id=${patientId}` : "animalbites/patient-details/"
    const res = await api2.get(url)
    console.log(`✅ Animal bite patient details fetched successfully: ${res.data.length} records`)
    return res.data
  } catch (error: any) {
    console.error("❌ Error fetching animal bite patient details:", error)
    console.error("Response data:", error.response?.data)
    console.error("Status:", error.response?.status)
    if (error.response?.status === 500) {
      console.error("Server error - check Django logs for details")
    }
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

export const getUniqueAnimalbitePatients = async (params: any = {}) => {
  try {
    console.log("🔍 Fetching unique animal bite patients with params:", params)
    const res = await api2.get("animalbites/unique-patients/", { params })
    console.log("✅ Unique animal bite patients fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Unique Animal Bite Patients")
    return { count: 0, results: [] }
  }
}

export const getAnimalBiteStats = async () => {
  try {
    console.log("🔍 Fetching animal bite stats...")
    const res = await api2.get("animalbites/stats/")
    console.log("✅ Animal bite stats fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Stats")
    return {
      total: 0,
      residents: 0,
      transients: 0,
      residentPercentage: 0,
      transientPercentage: 0
    }
  }
}

export const getAnimalBitePatientSummary = async () => {
  try {
    console.log("🔍 Fetching unique animal bite patient summary from /animalbites/patient-details/...")
    const res = await api2.get("animalbites/patient-details/")
    console.log("API Response:", res.data)
    const uniquePatients = res.data
    console.log(`✅ Found ${uniquePatients.length} unique animal bite patients.`)

    const patientIds = uniquePatients.map((p: any) => p.patient_id)
    const uniqueIds = [...new Set(patientIds)]
    if (patientIds.length !== uniqueIds.length) {
      console.warn("⚠️ Backend still returning duplicates:", patientIds.length, "vs", uniqueIds.length)
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

export const getPatientById = async (patientId: string) => {
  try {
    console.log(`🔍 Fetching patient with ID: ${patientId}...`)
    const res = await api2.get(`patientrecords/patients/${patientId}/`)
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
    const res = await api2.post("patientrecords/patients/", patientData)
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
    const res = await api2.get(`animalbites/referral/${referralId}/`)
    console.log("✅ Patient records by referral ID fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, `Fetch Patient Records by Referral ID: ${referralId}`)
    return []
  }
}

export const getAnimalBiteAnalytics = async ({ months = 12, month }: { months?: number; month?: string }): Promise<AnimalBiteAnalytics> => {
  try {
    console.log(`🔍 Fetching animal bite analytics for last ${months} months${month ? ` ending ${month}` : ''}...`)
    const res = await api2.get("animalbites/analytics/", {
      params: {
        months,
        ...(month && { month }),
      },
    })
    console.log("✅ Animal bite analytics fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Animal Bite Analytics")
    return {
      totalCases: 0,
      biteCases: 0,
      nonBiteCases: 0,
      mostCommonAnimal: "N/A",
      mostCommonSite: "N/A",
      monthlyAverage: 0,
      monthlyTrends: [],
      animalTypes: [],
      exposureTypes: [],
      patientTypes: [],
      exposureSites: [],
      recentCases: []
    }
  }
}

export const getAnimalBitePatientAnalytics = async (patientId: string) => {
  try {
    console.log(`🔍 Fetching patient analytics for ${patientId}...`)
    const res = await api2.get(`animalbites/analytics/${patientId}/`)
    console.log("✅ Patient analytics fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Patient Analytics")
    return null
  }
}