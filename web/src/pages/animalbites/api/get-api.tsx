import { api } from "@/api/api"

// Helper function for consistent error handling
const handleApiError = (err: any, operation: string) => {
  if (err.response) {
    console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}

// Fetch all animal bite patients
export const getAnimalbitePatients = async () => {
  try {
    const res = await api.get("patientrecords/patient-record")
    const allPatients = res.data

    // Filter only Animal Bite records
    const animalBitePatients = allPatients.filter((patient: any) => patient.patrec_type === "Animal Bites")

    return animalBitePatients
  } catch (error) {
    console.error("Error fetching animal bite patients:", error)
    return []
  }
}

// Fetch all patients (for the combobox in referral form)
export const getAllPatients = async () => {
  try {
    console.log("🔍 Fetching all patients...")
    const res = await api.get("patientrecords/patient/")
    console.log("✅ Patients fetched successfully:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error fetching patients:", error)
    return []
  }
}

// Fetch all animal bite referrals
export const getAnimalbiteReferrals = async () => {
  try {
    const res = await api.get("animalbites/referral/")
    return res.data
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return []
  }
}

// Fetch all animal bite details
export const getAnimalbiteDetails = async () => {
  try {
    const res = await api.get("animalbites/details/")
    return res.data
  } catch (error) {
    console.error("Error fetching bite details:", error)
    return []
  }
}

// Fetch biting animals
export const getBitingAnimals = async () => {
  try {
    console.log("🔍 Fetching biting animals...")
    const res = await api.get("animalbites/bite_animal/")
    console.log("✅ Biting animals fetched:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error fetching biting animals:", error)
    return []
  }
}

// Fetch exposure sites
export const getExposureSites = async () => {
  try {
    console.log("🔍 Fetching exposure sites...")
    const res = await api.get("animalbites/exposure_site/")
    console.log("✅ Exposure sites fetched:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error fetching exposure sites:", error)
    return []
  }
}

// Fetch staff members
export const getStaffMembers = async () => {
  try {
    console.log("🔍 Fetching staff members...")
    const res = await api.get("administration/staff/")
    console.log("✅ Staff members fetched:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error fetching staff members:", error)
    return []
  }
}

// Add new biting animal
export const addBitingAnimal = async (animalName: string) => {
  try {
    console.log("📦 Adding new biting animal:", animalName)
    const res = await api.post("animalbites/bite_animal/", { animal_name: animalName })
    console.log("✅ Biting animal added successfully:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error adding biting animal:", error)
    throw error
  }
}

// Add new exposure site
export const addExposureSite = async (siteName: string) => {
  try {
    console.log("📦 Adding new exposure site:", siteName)
    const res = await api.post("animalbites/exposure_site/", { exposure_site: siteName })
    console.log("✅ Exposure site added successfully:", res.data)
    return res.data
  } catch (error) {
    console.error("❌ Error adding exposure site:", error)
    throw error
  }
}

// Get unique patients (no duplicates) for the overall table
export const getUniqueAnimalbitePatients = async () => {
  try {
    const allPatients = await getAnimalbitePatients()
    const allReferrals = await getAnimalbiteReferrals()
    const allBiteDetails = await getAnimalbiteDetails()

    // Group patients by pat_id to avoid duplicates
    const uniquePatients = new Map()

    for (const patient of allPatients) {
      const patientId = patient.pat_details.personal_info.pat_id

      if (!uniquePatients.has(patientId)) {
        // Find the most recent referral for this patient
        const patientReferrals = allReferrals.filter((ref: any) => ref.patrec === patient.patrec_id)
        const mostRecentReferral = patientReferrals.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]

        // Find bite details for the most recent referral
        const biteDetail = mostRecentReferral
          ? allBiteDetails.find((detail: any) => detail.referral === mostRecentReferral.referral_id)
          : null

        uniquePatients.set(patientId, {
          ...patient,
          recordCount: patientReferrals.length,
          mostRecentReferral,
          mostRecentBiteDetail: biteDetail,
        })
      }
    }

    return Array.from(uniquePatients.values())
  } catch (error) {
    console.error("Error fetching unique patients:", error)
    return []
  }
}

// Get all records for a specific patient by pat_id
export const getPatientRecordsByPatId = async (patId: string) => {
  try {
    // Get all patient records for this pat_id
    const allPatients = await getAnimalbitePatients()
    const patientRecords = allPatients.filter(
      (patient: any) => patient.pat_details.personal_info.pat_id.toString() === patId.toString(),
    )

    if (patientRecords.length === 0) {
      throw new Error("Patient not found")
    }

    // Get all referrals for these patient records
    const allReferrals = await getAnimalbiteReferrals()
    const allBiteDetails = await getAnimalbiteDetails()

    const patientData = []

    for (const patientRecord of patientRecords) {
      const patrecId = patientRecord.patrec_id

      // Find referrals for this patient record
      const referrals = allReferrals.filter((ref: any) => ref.patrec === patrecId)

      for (const referral of referrals) {
        const biteDetail = allBiteDetails.find((detail: any) => detail.referral === referral.referral_id)

        if (biteDetail) {
          patientData.push({
            id: referral.referral_id,
            date: referral.date,
            transient: referral.transient,
            receiver: referral.receiver,
            sender: referral.sender,
            exposure: biteDetail.exposure_type,
            siteOfExposure: biteDetail.exposure_site,
            bitingAnimal: biteDetail.biting_animal,
            actions: biteDetail.actions_taken,
            referredBy: biteDetail.referredby,
            lab_exam: biteDetail.lab_exam || "N/A",
            bite_id: biteDetail.bite_id,
            patientInfo: patientRecord.pat_details.personal_info,
          })
        }
      }
    }

    return {
      patientInfo: patientRecords[0].pat_details.personal_info,
      records: patientData,
    }
  } catch (error) {
    console.error("Error fetching patient records:", error)
    throw error
  }
}
