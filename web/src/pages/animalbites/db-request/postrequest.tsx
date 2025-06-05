import { api } from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import axios from "axios"

// Helper function for consistent error handling
const handleApiError = (err: any, operation: string) => {
  if (axios.isAxiosError(err)) {
    console.error(`❌ ${operation} API Error:`, err.response?.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}

const patient = async (data: Record<string, any>) => {
  try {
    const payload = {
      pat_id: String(data.pat_id),
      patrec_type: "Animal Bites",
      created_at: new Date().toISOString(),
    }
    console.log("📦 Patient Record Payload:", payload)
    const res = await api.post("patientrecords/patient-record/", payload)
    console.log("✅ Patient record created successfully:", res.data)
    return res.data.patrec_id
  } catch (err: any) {
    handleApiError(err, "Patient Record")
  }
}

const referral = async (data: Record<string, any>) => {
  try {
    const payload = {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      transient: data.transient,
      patrec: data.patrec_id,
    }
    console.log("📦 Referral Payload:", payload)
    const res = await api.post("animalbites/referral/", payload)
    console.log("✅ Referral created successfully:", res.data)
    return res.data.referral_id
  } catch (err: any) {
    handleApiError(err, "Referral")
  }
}

const bitedetails = async (data: Record<string, any>) => {
  try {
    const payload = {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site, 
      biting_animal: data.biting_animal,
      actions_taken: data.p_actions || "No actions recorded",
      referredby: data.p_referred, // This should be the Staff ID
      referral: data.referral_id,
    }
    console.log("📦 Bite Details Payload:", payload)
    const res = await api.post("animalbites/details/", payload)
    console.log("✅ Bite details created successfully:", res.data)
    return res.data
  } catch (err: any) {
    handleApiError(err, "Bite Details")
  }
}

// Add new biting animal
const addBitingAnimal = async (animalName: string) => {
  try {
    const payload = { animal_name: animalName }
    console.log("📦 Adding Biting Animal:", payload)
    const res = await api.post("animalbites/bite_animal/", payload)
    console.log("✅ Biting animal added successfully:", res.data)
    return res.data
  } catch (err: any) {
    handleApiError(err, "Add Biting Animal")
  }
}

// Add new exposure site
const addExposureSite = async (siteName: string) => {
  try {
    const payload = { exposure_site: siteName }
    console.log("📦 Adding Exposure Site:", payload)
    const res = await api.post("animalbites/exposure_site/", payload)
    console.log("✅ Exposure site added successfully:", res.data)
    return res.data
  } catch (err: any) {
    handleApiError(err, "Add Exposure Site")
  }
}

// Main submission function with improved transaction handling
const submitAnimalBiteReferral = async (data: Record<string, any>) => {
  let createdPatrecId: number | null = null
  let createdReferralId: number | null = null

  try {
    console.log("🚀 Starting animal bite referral submission...")
    console.log("📝 Form data:", data)

    // Step 1: Create patient record
    createdPatrecId = await patient(data)
    console.log("🏥 Patient record created with ID:", createdPatrecId)

    // Step 2: Create referral with patient record ID
    const referralData = { ...data, patrec_id: createdPatrecId }
    createdReferralId = await referral(referralData)
    console.log("📝 Referral created with ID:", createdReferralId)

    // Step 3: Create bite details with referral ID
    const biteDetailsData = { ...data, referral_id: createdReferralId }
    const biteDetailsResult = await bitedetails(biteDetailsData)
    console.log("🦷 Bite details created:", biteDetailsResult)

    console.log("✅ Animal bite referral submission completed successfully!")

    // Return all IDs for reference
    return {
      patrec_id: createdPatrecId,
      referral_id: createdReferralId,
      bite_details: biteDetailsResult,
      formData: data,
    }
  } catch (err: any) {
    console.error("❌ Animal bite referral submission failed:", err)

    // Log what was created for manual cleanup if needed
    if (createdReferralId) {
      console.warn("⚠️ Referral was created but bite details failed. Referral ID:", createdReferralId)
    }
    if (createdPatrecId && !createdReferralId) {
      console.warn("⚠️ Patient record was created but referral failed. Patient Record ID:", createdPatrecId)
    }

    throw err
  }
}

export { patient, referral, bitedetails, addBitingAnimal, addExposureSite, submitAnimalBiteReferral }
