
import { api2 } from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import axios from "axios"
import { createPatient, getAllPatients } from "../api/get-api"

// Helper function for consistent error handling
const handleApiError = (err: any, operation: string) => {
  console.error(`❌ ${operation} - Full Error Object:`, err)

  if (axios.isAxiosError(err)) {
    console.error(`❌ ${operation} - Axios Error Details:`, {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
      url: err.config?.url,
      method: err.config?.method,
      headers: err.config?.headers,
      requestData: err.config?.data,
    })

    // Try to extract the most meaningful error message
    let errorMessage = `${operation} failed`

    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        errorMessage = err.response.data
      } else if (err.response.data.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.response.data.error) {
        errorMessage = err.response.data.error
      } else if (err.response.data.non_field_errors) {
        errorMessage = err.response.data.non_field_errors.join(", ")
      } else {
        // Try to extract field-specific errors
        const fieldErrors = []
        for (const [field, errors] of Object.entries(err.response.data)) {
          if (Array.isArray(errors)) {
            fieldErrors.push(`${field}: ${errors.join(", ")}`)
          } else if (typeof errors === "string") {
            fieldErrors.push(`${field}: ${errors}`)
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join("; ")
        } else {
          errorMessage = `${operation} failed with status ${err.response.status}`
        }
      }
    } else if (err.message) {
      errorMessage = err.message
    }

    console.error(`❌ ${operation} - Extracted Error Message:`, errorMessage)
    throw new Error(errorMessage)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
    throw new Error(`Unexpected error during ${operation.toLowerCase()}: ${err.message || "Unknown error"}`)
  }
}

// Create a patient record
const patient = async (data: Record<string, any>) => {
  try {
    // Check if we need to create a new patient or use an existing one
    let patientId = data.pat_id
    
    if (!patientId && data.createNewPatient) {
      // Create a new patient first
      const newPatientData = {
        personal_info: {
          per_fname: data.p_fname,
          per_lname: data.p_lname,
          per_mname: data.p_mname || "",
          per_sex: data.p_gender,
          per_dob: data.p_dob || formatDate(new Date()),
          per_address: data.p_address || "",
          per_contact: data.p_contact || "",
        }
      }
      
      console.log("📝 Creating new patient:", newPatientData)
      const newPatient = await createPatient(newPatientData)
      
      if (!newPatient || !newPatient.pat_id) {
        throw new Error("Failed to create new patient")
      }
      
      patientId = newPatient.pat_id
      console.log("✅ New patient created with ID:", patientId)
    }
    
    // Now create the patient record
    const payload = {
      pat_id: Number(patientId),
      patrec_type: "Animal Bites",
      created_at: new Date().toISOString(),
    }
    console.log("📦 Patient Record Payload:", payload)

    const res = await api2.post("patientrecords/patient-record/", payload)
    console.log("✅ Patient record created successfully:", res.data)

    if (!res.data.patrec_id) {
      console.warn("⚠️ Patient record created but no patrec_id returned. Full response:", res.data)
      throw new Error("Patient record created but no patrec_id returned")
    }

    return res.data.patrec_id
  } catch (err: any) {
    console.error("❌ Patient record creation failed - Raw error:", err)
    handleApiError(err, "Patient Record Creation")
  }
}

const referral = async (data: Record<string, any>) => {
  try {
    // Validate required data
    if (!data.patrec_id) {
      throw new Error("Patient record ID is required for referral")
    }

    const payload = {
      receiver: data.receiver,
      sender: data.sender,
      date: formatDate(data.date),
      transient: data.transient,
      patrec: data.patrec_id,
    }

    console.log("📦 Referral Payload:", payload)
    console.log("🔗 Making request to: animalbites/referral/")

    const res = await api2.post("animalbites/referral/", payload)
    console.log("✅ Referral created successfully:", res.data)

    if (!res.data.referral_id) {
      console.warn("⚠️ Referral created but no referral_id returned. Full response:", res.data)
      throw new Error("Referral created but no referral_id returned")
    }

    return res.data.referral_id
  } catch (err: any) {
    console.error("❌ Referral creation failed - Raw error:", err)
    handleApiError(err, "Referral Creation")
  }
}

const bitedetails = async (data: Record<string, any>) => {
  try {
    // Validate required data
    if (!data.referral_id) {
      throw new Error("Referral ID is required for bite details")
    }

    // Safely parse numeric values or use null for foreign keys
    const exposureSiteId = data.exposure_site
      ? typeof data.exposure_site === "object"
        ? data.exposure_site.id
        : Number(data.exposure_site)
      : null

    const bitingAnimalId = data.biting_animal
      ? typeof data.biting_animal === "object"
        ? data.biting_animal.id
        : Number(data.biting_animal)
      : null

    // Use the referrer_name field directly
    const payload = {
      exposure_type: data.exposure_type,
      exposure_site: exposureSiteId,
      biting_animal: bitingAnimalId,
      actions_taken: data.p_actions || "No actions recorded",
      referrer_name: data.p_referred, // Use the string value directly
      referredby: null, // Set to null since we're using referrer_name
      referral: data.referral_id,
    }

    console.log("📦 Bite Details Payload:", payload)
    console.log("🔗 Making request to: animalbites/details/")

    const res = await api2.post("animalbites/details/", payload)
    console.log("✅ Bite details created successfully:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Bite details creation failed - Raw error:", err)
    handleApiError(err, "Bite Details Creation")
  }
}

// Add new biting animal
const addBitingAnimal = async (animalName: string) => {
  try {
    if (!animalName || animalName.trim() === "") {
      throw new Error("Animal name is required")
    }

    const payload = { animal_name: animalName.trim() }
    console.log("📦 Adding Biting Animal:", payload)

    const res = await api2.post("animalbites/bite_animal/", payload)
    console.log("✅ Biting animal added successfully:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Adding biting animal failed - Raw error:", err)
    handleApiError(err, "Add Biting Animal")
  }
}

// Add new exposure site
const addExposureSite = async (siteName: string) => {
  try {
    if (!siteName || siteName.trim() === "") {
      throw new Error("Site name is required")
    }

    const payload = { exposure_site: siteName.trim() }
    console.log("📦 Adding Exposure Site:", payload)

    const res = await api2.post("animalbites/exposure_site/", payload)
    console.log("✅ Exposure site added successfully:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Adding exposure site failed - Raw error:", err)
    handleApiError(err, "Add Exposure Site")
  }
}

// Test API connectivity
const testApiConnection = async () => {
  try {
    console.log("🧪 Testing API connection...")
    console.log("🔗 API base URL:", api2.defaults.baseURL)

    // Test a simple GET request first
    const testResponse = await api2.get("patientrecords/patient/")
    console.log("✅ API connection test successful:", {
      status: testResponse.status,
      dataLength: testResponse.data?.length,
      sampleData: testResponse.data?.slice(0, 1),
    })

    return true
  } catch (error: any) {
    console.error("❌ API connection test failed:", error)
    handleApiError(error, "API Connection Test")
    return false
  }
}

// Delete a bite record
const deleteAnimalBiteRecord = async (referralId: number) => {
  try {
    console.log(`🗑️ Deleting animal bite record with referral ID: ${referralId}`)
    
    // First, get the bite details to know what to clean up
    const biteDetailsRes = await api2.get(`animalbites/details/?referral=${referralId}`)
    const biteDetails = biteDetailsRes.data
    
    // Delete the bite details first (if they exist)
    if (biteDetails && biteDetails.length > 0) {
      for (const detail of biteDetails) {
        await api2.delete(`animalbites/details/${detail.bite_id}/`)
        console.log(`✅ Deleted bite detail with ID: ${detail.bite_id}`)
      }
    }
    
    // Then delete the referral
    await api2.delete(`animalbites/referral/${referralId}/`)
    console.log(`✅ Deleted referral with ID: ${referralId}`)
    
    return true
  } catch (err: any) {
    console.error(`❌ Failed to delete animal bite record: ${err}`)
    handleApiError(err, "Delete Animal Bite Record")
    return false
  }
}
const testFetchPatients = async () => {
  try {
    console.log("🧪 Testing patient fetching...")
    const patients = await getAllPatients()
    console.log(`✅ Successfully fetched ${patients.length} patients`)
    console.log("📊 Sample patient data:", patients.slice(0, 2))
    return patients
  } catch (error) {
    console.error("❌ Failed to fetch patients:", error)
    return []
  }
}

// Main submission function with improved transaction handling
const submitAnimalBiteReferral = async (data: Record<string, any>) => {
  let createdPatrecId: number | null = null
  let createdReferralId: number | null = null

  try {
    console.log("🚀 Starting animal bite referral submission...")
    console.log("📝 Complete form data received:", data)

    // Test API connection first
    console.log("🧪 Testing API connection before submission...")
    await testApiConnection()

    // Validate all required fields before starting
    const requiredFields = [
      "pat_id",
      "receiver",
      "sender",
      "date",
      "exposure_type",
      "exposure_site",
      "biting_animal",
      "p_actions",
      "p_referred",
    ]

    const missingFields = requiredFields.filter((field) => !data[field])
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
    }

    console.log("✅ All required fields present")

    // Step 1: Create patient record
    console.log("🏥 Step 1: Creating patient record...")
    createdPatrecId = await patient(data)
    console.log("🏥 Patient record created with ID:", createdPatrecId)

    // Step 2: Create referral with patient record ID
    console.log("📝 Step 2: Creating referral...")
    const referralData = { ...data, patrec_id: createdPatrecId }
    console.log("📦 Referral Data:", referralData)
    createdReferralId = await referral(referralData)
    console.log("📝 Referral created with ID:", createdReferralId)

    // Step 3: Create bite details with referral ID
    console.log("🦷 Step 3: Creating bite details...")
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

    // Re-throw the error with more context
    throw new Error(`Submission failed: ${err.message}`)
  }
}

export { patient, referral, bitedetails, addBitingAnimal, addExposureSite, submitAnimalBiteReferral, testApiConnection,deleteAnimalBiteRecord  }