// import { api2 } from "@/api/api"
// import { formatDate } from "@/helpers/dateFormatter"
// import axios from "axios"

// // Helper function for consistent error handling
// const handleApiError = (err: any, operation: string) => {
//   console.error(`❌ ${operation} - Full Error Object:`, err)

//   if (axios.isAxiosError(err)) {
//     console.error(`❌ ${operation} - Axios Error Details:`, {
//       status: err.response?.status,
//       statusText: err.response?.statusText,
//       data: err.response?.data,
//       message: err.message,
//       url: err.config?.url,
//       method: err.config?.method,
//       headers: err.config?.headers,
//       requestData: err.config?.data,
//     })

//     // Try to extract the most meaningful error message
//     let errorMessage = `${operation} failed`

//     if (err.response?.data) {
//       if (typeof err.response.data === "string") {
//         errorMessage = err.response.data
//       } else if (err.response.data.detail) {
//         errorMessage = err.response.data.detail
//       } else if (err.response.data.message) {
//         errorMessage = err.response.data.message
//       } else if (err.response.data.error) {
//         errorMessage = err.response.data.error
//       } else if (err.response.data.non_field_errors) {
//         errorMessage = err.response.data.non_field_errors.join(", ")
//       } else {
//         // Try to extract field-specific errors
//         const fieldErrors = []
//         for (const [field, errors] of Object.entries(err.response.data)) {
//           if (Array.isArray(errors)) {
//             fieldErrors.push(`${field}: ${errors.join(", ")}`)
//           } else if (typeof errors === "string") {
//             fieldErrors.push(`${field}: ${errors}`)
//           }
//         }
//         if (fieldErrors.length > 0) {
//           errorMessage = fieldErrors.join("; ")
//         } else {
//           errorMessage = `${operation} failed with status ${err.response.status}`
//         }
//       }
//     } else if (err.message) {
//       errorMessage = err.message
//     }

//     console.error(`❌ ${operation} - Extracted Error Message:`, errorMessage)
//     throw new Error(errorMessage)
//   } else {
//     console.error(`❌ Unexpected ${operation} Error:`, err)
//     throw new Error(`Unexpected error during ${operation.toLowerCase()}: ${err.message || "Unknown error"}`)
//   }
// }

// // Create a patient record
// const patient = async (data: Record<string, any>) => {
//   try {
//     // Validate required data
//     if (!data.pat_id) {
//       throw new Error("Patient ID is required")
//     }

//     const payload = {
//       pat_id: data.pat_id,
//       patrec_type: "Animal Bites",
//       created_at: new Date().toISOString(),
//     }

//     console.log(`📦 Creating patient record for pat_id:`, payload)
//     console.log("📦 Patient Record Payload:", payload)
    
//     // console.log(`🔗 Making request to: patientrecords/patient-record/${patId}`)

//      const res = await api2.post(`patientrecords/patient-record/${data.pat_id}`, payload)  // POST to endpoint without patId in URL
//     console.log("✅ Patient record created successfully:", res.data)

//     if (!res.data.patrec_id) {
//       console.warn("⚠️ Patient record created but no patrec_id returned. Full response:", res.data)
//       throw new Error("Patient record created but no patrec_id returned")
//     }

//     return res.data.patrec_id
//   } catch (err: any) {
//     console.error("❌ Patient record creation failed - Raw error:", err)
//     handleApiError(err, "Patient Record Creation")
//   }
// }

// const referral = async (data: Record<string, any>) => {
//   try {
//     // Validate required data
//     if (!data.patrec_id) {
//       throw new Error("Patient record ID is required for referral")
//     }

//     const payload = {
//       receiver: data.receiver,
//       sender: data.sender,
//       date: formatDate(data.date),
//       transient: data.transient,
//       patrec: data.patrec_id,
//     }

//     console.log("📦 Referral Payload:", payload)
//     console.log("🔗 Making request to: animalbites/referral/")

//     const res = await api2.post("animalbites/referral/", payload)
//     console.log("✅ Referral created successfully:", res.data)

//     if (!res.data.referral_id) {
//       console.warn("⚠️ Referral created but no referral_id returned. Full response:", res.data)
//       throw new Error("Referral created but no referral_id returned")
//     }

//     return res.data.referral_id
//   } catch (err: any) {
//     console.error("❌ Referral creation failed - Raw error:", err)
//     handleApiError(err, "Referral Creation")
//   }
// }

// const bitedetails = async (data: Record<string, any>) => {
//   try {
//     // Validate required data
//     if (!data.referral_id) {
//       throw new Error("Referral ID is required for bite details")
//     }

//     const payload = {
//       exposure_type: data.exposure_type,
//       exposure_site: Number.parseInt(data.exposure_site), // Ensure it's a number
//       biting_animal: Number.parseInt(data.biting_animal), // Ensure it's a number
//       actions_taken: data.p_actions || "No actions recorded",
//       referredby: Number.parseInt(data.p_referred), // Ensure it's a number
//       referral: data.referral_id,
//     }

//     console.log("📦 Bite Details Payload:", payload)
//     console.log("🔗 Making request to: animalbites/details/")

//     const res = await api2.post("animalbites/details/", payload)
//     console.log("✅ Bite details created successfully:", res.data)
//     return res.data
//   } catch (err: any) {
//     console.error("❌ Bite details creation failed - Raw error:", err)
//     handleApiError(err, "Bite Details Creation")
//   }
// }

// // Add new biting animal
// const addBitingAnimal = async (animalName: string) => {
//   try {
//     if (!animalName || animalName.trim() === "") {
//       throw new Error("Animal name is required")
//     }

//     const payload = { animal_name: animalName.trim() }
//     console.log("📦 Adding Biting Animal:", payload)

//     const res = await api2.post("animalbites/bite_animal/", payload)
//     console.log("✅ Biting animal added successfully:", res.data)
//     return res.data
//   } catch (err: any) {
//     console.error("❌ Adding biting animal failed - Raw error:", err)
//     handleApiError(err, "Add Biting Animal")
//   }
// }

// // Add new exposure site
// const addExposureSite = async (siteName: string) => {
//   try {
//     if (!siteName || siteName.trim() === "") {
//       throw new Error("Site name is required")
//     }

//     const payload = { exposure_site: siteName.trim() }
//     console.log("📦 Adding Exposure Site:", payload)

//     const res = await api2.post("animalbites/exposure_site/", payload)
//     console.log("✅ Exposure site added successfully:", res.data)
//     return res.data
//   } catch (err: any) {
//     console.error("❌ Adding exposure site failed - Raw error:", err)
//     handleApiError(err, "Add Exposure Site")
//   }
// }

// // Test API connectivity
// const testApiConnection = async () => {
//   try {
//     console.log("🧪 Testing API connection...")
//     console.log("🔗 API base URL:", api2.defaults.baseURL)

//     // Test a simple GET request first
//     const testResponse = await api2.get("patientrecords/patient/")
//     console.log("✅ API connection test successful:", {
//       status: testResponse.status,
//       dataLength: testResponse.data?.length,
//       sampleData: testResponse.data?.slice(0, 1),
//     })

//     return true
//   } catch (error: any) {
//     console.error("❌ API connection test failed:", error)
//     handleApiError(error, "API Connection Test")
//     return false
//   }
// }

// // Main submission function with improved transaction handling
// const submitAnimalBiteReferral = async (data: Record<string, any>) => {
//   let createdPatrecId: number | null = null
//   let createdReferralId: number | null = null

//   try {
//     console.log("🚀 Starting animal bite referral submission...")
//     console.log("📝 Complete form data received:", data)

//     // Test API connection first
//     console.log("🧪 Testing API connection before submission...")
//     await testApiConnection()

//     // Validate all required fields before starting
//     const requiredFields = [
//       "pat_id",
//       "receiver",
//       "sender",
//       "date",
//       "exposure_type",
//       "exposure_site",
//       "biting_animal",
//       "p_actions",
//       "p_referred",
//     ]

//     const missingFields = requiredFields.filter((field) => !data[field])
//     if (missingFields.length > 0) {
//       throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
//     }

//     console.log("✅ All required fields present")

//     // Step 1: Create patient record
//     console.log("🏥 Step 1: Creating patient record...")
//     createdPatrecId = await patient(data)
//     console.log("🏥 Patient record created with ID:", createdPatrecId)

//     // Step 2: Create referral with patient record ID
//     console.log("📝 Step 2: Creating referral...")
//     const referralData = { ...data, patrec_id: createdPatrecId }
//     createdReferralId = await referral(referralData)
//     console.log("📝 Referral created with ID:", createdReferralId)

//     // Step 3: Create bite details with referral ID
//     console.log("🦷 Step 3: Creating bite details...")
//     const biteDetailsData = { ...data, referral_id: createdReferralId }
//     const biteDetailsResult = await bitedetails(biteDetailsData)
//     console.log("🦷 Bite details created:", biteDetailsResult)

//     console.log("✅ Animal bite referral submission completed successfully!")

//     // Return all IDs for reference
//     return {
//       patrec_id: createdPatrecId,
//       referral_id: createdReferralId,
//       bite_details: biteDetailsResult,
//       formData: data,
//     }
//   } catch (err: any) {
//     console.error("❌ Animal bite referral submission failed:", err)

//     // Log what was created for manual cleanup if needed
//     if (createdReferralId) {
//       console.warn("⚠️ Referral was created but bite details failed. Referral ID:", createdReferralId)
//     }
//     if (createdPatrecId && !createdReferralId) {
//       console.warn("⚠️ Patient record was created but referral failed. Patient Record ID:", createdPatrecId)
//     }

//     // Re-throw the error with more context
//     throw new Error(`Submission failed: ${err.message}`)
//   }
// }

// export { patient, referral, bitedetails, addBitingAnimal, addExposureSite, submitAnimalBiteReferral, testApiConnection }


import { api2 } from "@/api/api"
import { formatDate } from "@/helpers/dateFormatter"
import axios from "axios"

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

// Create a patient record - FIXED VERSION
const patient = async (data: Record<string, any>) => {
  try {
    // Validate required data
    if (!data.pat_id) {
      throw new Error("Patient ID is required")
    }

    const payload = {
      pat_id: data.pat_id,
      patrec_type: "Animal Bites",
      created_at: new Date().toISOString(),
    }

    console.log("📦 Patient Record Payload:", payload)
    
    // FIXED: POST to the base endpoint without pat_id in URL
    console.log(`🔗 Making request to: patientrecords/patient-record/`)
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

    const payload = {
      exposure_type: data.exposure_type,
      exposure_site: data.exposure_site, // Ensure it's a number
      biting_animal: data.biting_animal, // Ensure it's a number
      actions_taken: data.p_actions || "No actions recorded",

      referredby: data.p_referred,
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

export { patient, referral, bitedetails, addBitingAnimal, addExposureSite, submitAnimalBiteReferral, testApiConnection }