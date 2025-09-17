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
      } else if (Object.keys(err.response.data).length > 0) {
        // Fallback to showing specific field errors if available
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ")
      }
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage = "No response received from server."
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = err.message
    }
    throw new Error(errorMessage)
  } else {
    // Any other non-Axios error
    throw new Error(`An unexpected error occurred: ${err.message || err}`)
  }
}

// Submit a new animal bite referral
export const submitAnimalBiteReferral = async (data: any) => {
  try {
    console.log("📝 Submitting animal bite referral:", data)

    // For custom exposure sites and biting animals, send the actual name
    const payload = { ...data }

    // Handle custom exposure site
    if (data.exposure_site && data.exposure_site.startsWith("custom-")) {
      // Find the name from the options array
      const exposureSiteName = data.exposure_site_name || data.exposure_site
      payload.exposure_site = exposureSiteName
      payload.exposure_site_name = exposureSiteName
    }

    // Handle custom biting animal
    if (data.biting_animal && data.biting_animal.startsWith("custom-")) {
      // Find the name from the options array
      const bitingAnimalName = data.biting_animal_name || data.biting_animal
      payload.biting_animal = bitingAnimalName
      payload.biting_animal_name = bitingAnimalName
    }

    console.log("📦 Prepared payload:", payload)

    const res = await api2.post("animalbites/create-record/", payload)
    console.log("✅ Animal bite referral submitted successfully:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Failed to submit animal bite referral:", err)
    handleApiError(err, "Submit Animal Bite Referral")
  }
}

// Update an existing animal bite record
export const updateAnimalBiteRecord = async (biteId: number, data: any) => {
  try {
    console.log(`📝 Updating animal bite record ID: ${biteId}`, data)
    const res = await api2.put(`animalbites/update-record/${biteId}/`, data)
    console.log("✅ Animal bite record updated successfully:", res.data)
    return res.data
  } catch (err: any) {
    console.error("❌ Failed to update animal bite record:", err)
    handleApiError(err, "Update Animal Bite Record")
  }
}

// Delete an animal bite record by its bite_id
export const deleteAnimalBiteRecord = async (biteId: number) => {
  try {
    console.log(`🗑️ Deleting animal bite record ID: ${biteId}`)
    const res = await api2.delete(`animalbites/record/${biteId}/delete/`)
    console.log("✅ Animal bite record deleted successfully:", res.data)

    return res.data
  } catch (err: any) {
    console.error("❌ Failed to delete animal bite record:", err)
    handleApiError(err, "Delete Animal Bite Record")
  }
}

// Delete all animal bite records for a patient
export const deleteAnimalBitePatient = async (patientId: string) => {
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
// const testFetchPatients = async () => {
//   try {
//     console.log("🧪 Testing patient fetching...")
//     const patients = await getAllPatients()
//     console.log(`✅ Successfully fetched ${patients.length} patients`)
//     console.log("📊 Sample patient data:", patients.slice(0, 2))
//     return patients
//   } catch (error) {
//     console.error("❌ Failed to fetch patients:", error)
//     return []
//   }
// }
