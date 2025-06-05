import { api } from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"

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
    console.error("Error:", error)
    return [] // Return empty array on error
  }
}

// Fetch all animal bite referrals
export const getAnimalbiteReferrals = async () => {
  try {
    const res = await api.get("animalbites/referral/")
    return res.data
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

// Fetch all animal bite details
export const getAnimalbiteDetails = async () => {
  try {
    const res = await api.get("animalbites/details/")
    return res.data
  } catch (error) {
    console.error("Error:", error)
    return []
  }
}

// Fetch biting animals
export const getBitingAnimals = async () => {
  try {
    const res = await api.get("animalbites/bite_animal/")
    return res.data
  } catch (error) {
    console.error("Error fetching biting animals:", error)
    return []
  }
}

// Fetch exposure sites
export const getExposureSites = async () => {
  try {
    const res = await api.get("animalbites/exposure_site/")
    return res.data
  } catch (error) {
    console.error("Error fetching exposure sites:", error)
    return []
  }
}

// Add new biting animal
export const addBitingAnimal = async (animalName: string) => {
  try {
    const res = await api.post("animalbites/bite_animal/", { animal_name: animalName })
    return res.data
  } catch (error) {
    console.error("Error adding biting animal:", error)
    throw error
  }
}

// Add new exposure site
export const addExposureSite = async (siteName: string) => {
  try {
    const res = await api.post("animalbites/exposure_site/", { exposure_site: siteName })
    return res.data
  } catch (error) {
    console.error("Error adding exposure site:", error)
    throw error
  }
}

// Submit a new animal bite referral with improved transaction handling
export const submitAnimalBiteReferral = async (data: Record<string, any>) => {
  let createdPatrecId: number | null = null
  let createdReferralId: number | null = null

  try {
    // Step 1: Create patient record
    const patientPayload = {
      pat_id: String(data.pat_id),
      patrec_type: "Animal Bites",
      created_at: new Date().toISOString(),
    }
    console.log("📦 Patient Record Payload:", patientPayload)
    const patientResponse = await api.post("patientrecords/patient-record/", patientPayload)
    createdPatrecId = patientResponse.data.patrec_id
    console.log("🏥 Patient record created with ID:", createdPatrecId)

    // Step 2: Create referral with patient record ID
    const referralPayload = {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      transient: data.transient,
      patrec: createdPatrecId,
    }
    console.log("📦 Referral Payload:", referralPayload)
    const referralResponse = await api.post("animalbites/referral/", referralPayload)
    createdReferralId = referralResponse.data.referral_id
    console.log("📝 Referral created with ID:", createdReferralId)

    // Step 3: Create bite details with referral ID
    const biteDetailsPayload = {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site, // This should be the ID from the select
      biting_animal: data.biting_animal, // This should be the ID from the select
      actions_taken: data.p_actions || "No actions recorded",
      referredby: data.p_referred,
      referral: createdReferralId,
    }
    console.log("📦 Bite Details Payload:", biteDetailsPayload)
    const biteDetailsResponse = await api.post("animalbites/details/", biteDetailsPayload)
    console.log("🦷 Bite details created:", biteDetailsResponse.data)

    // Return all created data for reference
    return {
      patrec_id: createdPatrecId,
      referral_id: createdReferralId,
      bite_details: biteDetailsResponse.data,
      formData: data,
    }
  } catch (err: any) {
    console.error("❌ Animal bite referral submission failed:", err)

    // Cleanup: If we created records but failed later, we should ideally delete them
    // However, this requires additional delete endpoints in your Django API
    // For now, we'll just log the error and let the user know
    if (createdReferralId) {
      console.warn("⚠️ Referral was created but bite details failed. Manual cleanup may be required.")
    }
    if (createdPatrecId && !createdReferralId) {
      console.warn("⚠️ Patient record was created but referral failed. Manual cleanup may be required.")
    }

    throw err
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

// Get patient record by ID from the overall table
export const getPatientById = async (patientIndex: string | number) => {
  try {
    // First, get all patient records
    const allPatients = await getAnimalbitePatients()

    // Convert index to number and subtract 1 to get array index (since display index starts at 1)
    const index = Number(patientIndex) - 1

    // Get the patient record at this index
    const patientRecord = allPatients[index]

    if (!patientRecord) {
      throw new Error("Patient record not found")
    }

    // Get the patient record ID
    const patrecId = patientRecord.patrec_id

    // Get all referrals
    const allReferrals = await getAnimalbiteReferrals()

    // Find referrals for this patient
    const patientReferrals = allReferrals.filter((ref: any) => ref.patrec === patrecId)

    // Get all bite details
    const allBiteDetails = await getAnimalbiteDetails()

    // Find bite details for this patient's referrals
    const patientBiteDetails = []

    for (const referral of patientReferrals) {
      const biteDetail = allBiteDetails.find((detail: any) => detail.referral === referral.referral_id)
      if (biteDetail) {
        patientBiteDetails.push({
          ...biteDetail,
          referral_data: referral,
        })
      }
    }

    // Return the complete patient data
    return {
      patientRecord,
      referrals: patientReferrals,
      biteDetails: patientBiteDetails,
    }
  } catch (error) {
    console.error("Error fetching patient data:", error)
    throw error
  }
}

// Get all records for a specific patient
export const getPatientRecords = async (patientIndex: string | number) => {
  try {
    // First, get all patient records
    const allPatients = await getAnimalbitePatients()

    // Convert index to number and subtract 1 to get array index (since display index starts at 1)
    const index = Number(patientIndex) - 1

    // Get the patient record at this index
    const patientRecord = allPatients[index]

    if (!patientRecord) {
      throw new Error("Patient record not found")
    }

    // Get the patient record ID
    const patrecId = patientRecord.patrec_id

    // Get all referrals
    const allReferrals = await getAnimalbiteReferrals()

    // Find referrals for this patient
    const patientReferrals = allReferrals.filter((ref: any) => ref.patrec === patrecId)

    // Get all bite details
    const allBiteDetails = await getAnimalbiteDetails()

    // Combine referrals with their bite details
    const patientRecords = []

    for (const referral of patientReferrals) {
      const biteDetail = allBiteDetails.find((detail: any) => detail.referral === referral.referral_id)

      if (biteDetail) {
        patientRecords.push({
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
        })
      }
    }

    return patientRecords
  } catch (error) {
    console.error("Error fetching patient records:", error)
    return []
  }
}
