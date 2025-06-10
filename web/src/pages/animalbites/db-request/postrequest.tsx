import { api2 } from "@/api/api"
import axios from "axios"
import { getAllPatients } from "../api/get-api"

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

// Helper function to get the name from option ID
const getOptionName = (optionId: string, optionType: "exposure_site" | "biting_animal"): string => {
  // Map IDs to names for exposure sites
  const exposureSiteMap: Record<string, string> = {
    head: "Head",
    neck: "Neck",
    hand: "Hand",
    foot: "Foot",
    trunk: "Trunk",
  }

  // Map IDs to names for biting animals
  const bitingAnimalMap: Record<string, string> = {
    dog: "Dog",
    cat: "Cat",
    rodent: "Rodent",
  }

  if (optionType === "exposure_site") {
    return exposureSiteMap[optionId] || optionId
  } else if (optionType === "biting_animal") {
    return bitingAnimalMap[optionId] || optionId
  }

  return optionId
}

// Main submission function
const submitAnimalBiteReferral = async (data: Record<string, any>) => {
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
      "p_address"
    ]

    const missingFields = requiredFields.filter((field) => !data[field])
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
    }

    console.log("✅ All required fields present")

    // Convert option IDs to readable names
    const exposureSiteName = getOptionName(data.exposure_site, "exposure_site")
    const bitingAnimalName = getOptionName(data.biting_animal, "biting_animal")

    console.log(`📦 Exposure site: ${data.exposure_site} -> ${exposureSiteName}`)
    console.log(`📦 Biting animal: ${data.biting_animal} -> ${bitingAnimalName}`)

    // Prepare payload for the backend
    const payload = {
      pat_id: String(data.pat_id),
      receiver: data.receiver,
      sender: data.sender,
      date: data.date,
      // per_address: data.p_address,
      transient: data.transient || false,
      exposure_type: data.exposure_type,
      exposure_site: exposureSiteName, // Send the readable name
      biting_animal: bitingAnimalName, // Send the readable name
      actions_taken: data.p_actions || "",
      referredby: data.p_referred || "",
    }

    console.log("📦 Prepared Payload:", payload)
    console.log("📦 pat_id type:", typeof payload.pat_id, "value:", payload.pat_id)

    // Try the main endpoint first
    let res
    try {
      console.log("🔄 Attempting to create record with main endpoint...")
      res = await api2.post("animalbites/create-record/", payload)
      console.log("✅ Animal bite record created successfully with main endpoint:", res.data)
    } catch (mainError: any) {
      console.warn("⚠️ Main endpoint failed, trying alternative endpoint...")
      console.log("🔄 Attempting to create record with alternative endpoint...")

      try {
        res = await api2.post("animalbites/create-record-alt/", payload)
        console.log("✅ Animal bite record created successfully with alternative endpoint:", res.data)
      } catch (altError: any) {
        console.error("❌ Both endpoints failed")
        throw mainError // Throw the original error
      }
    }

    console.log("✅ Animal bite referral submission completed successfully!")

    // Return the response data
    return {
      patrec_id: res.data.patrec_id,
      referral_id: res.data.referral_id,
      bite_id: res.data.bite_id,
      message: res.data.message,
      formData: data,
    }
  } catch (err: any) {
    console.error("❌ Animal bite referral submission failed:", err)
    handleApiError(err, "Animal Bite Referral Submission")
  }
}

// Update animal bite record
const updateAnimalBiteRecord = async (biteId: number, data: Record<string, any>) => {
  try {
    console.log(`🔄 Updating animal bite record ${biteId}...`)
    console.log("📝 Update data:", data)

    // Convert option IDs to readable names if they exist
    const updatePayload = { ...data }

    if (data.exposure_site) {
      updatePayload.exposure_site = getOptionName(data.exposure_site, "exposure_site")
    }

    if (data.biting_animal) {
      updatePayload.biting_animal = getOptionName(data.biting_animal, "biting_animal")
    }

    console.log("📦 Update Payload:", updatePayload)

    const res = await api2.put(`animalbites/update-record/${biteId}/`, updatePayload)
    console.log("✅ Animal bite record updated successfully:", res.data)

    return res.data
  } catch (err: any) {
    console.error("❌ Animal bite record update failed:", err)
    handleApiError(err, "Animal Bite Record Update")
  }
}

// Delete animal bite record by bite_id
const deleteAnimalBiteRecord = async (biteId: number) => {
  try {
    console.log(`🗑️ Deleting animal bite record with bite ID: ${biteId}`)

    const res = await api2.delete(`animalbites/record/${biteId}/delete/`)
    console.log("✅ Animal bite record deleted successfully:", res.data)

    return res.data
  } catch (err: any) {
    console.error("❌ Failed to delete animal bite record:", err)
    handleApiError(err, "Delete Animal Bite Record")
  }
}

// Delete all animal bite records for a patient
const deleteAnimalBitePatient = async (patientId: string) => {
  try {
    console.log(`🗑️ Deleting all animal bite records for patient ID: ${patientId}`)

    const res = await api2.delete(`animalbites/patient/${patientId}/delete/`)
    console.log("✅ All animal bite records deleted successfully:", res.data)

    return res.data
  } catch (err: any) {
    console.error("❌ Failed to delete patient animal bite records:", err)
    handleApiError(err, "Delete Patient Animal Bite Records")
  }
}

// Test function to fetch patients
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

export {
  submitAnimalBiteReferral,
  updateAnimalBiteRecord,
  deleteAnimalBiteRecord,
  deleteAnimalBitePatient,
  testApiConnection,
  testFetchPatients,
  getOptionName,
}
