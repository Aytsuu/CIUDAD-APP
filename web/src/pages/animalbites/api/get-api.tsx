import { api2 } from "@/api/api"

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
    console.log("🔍 Fetching animal bite patients...")
    const res = await api2.get("patientrecords/patient/")
    const allPatients = res.data

    // Filter only Animal Bite records
    const animalBitePatients = allPatients.filter((patient: any) => patient.patrec_type === "Animal Bites")
    console.log(`✅ Found ${animalBitePatients.length} animal bite patients`)
    return animalBitePatients
  } catch (error) {
    console.error("❌ Error fetching animal bite patients:", error)
    return []
  }
}

// Fetch all patients (for the combobox in referral form)
export const getAllPatients = async () => {
  try {
    const res = await api2.get("patientrecords/patient/")
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
    console.log("🔍 Fetching animal bite referrals...")
    const res = await api2.get("animalbites/referral/")
    console.log(`✅ Found ${res.data.length} animal bite referrals`)
    return res.data
  } catch (error) {
    console.error("❌ Error fetching animal bite referrals:", error)
    return []
  }
}

// Fetch all animal bite details
export const getAnimalbiteDetails = async () => {
  try {
    console.log("🔍 Fetching animal bite details...")
    const res = await api2.get("animalbites/details/")
    return res
    } 
  catch (error) {
    console.error("❌ Error fetching animal bite details:", error)
    return []
  }
}



// Get unique patients (no duplicates) for the overall table
export const getUniqueAnimalbitePatients = async () => {
  try {
    console.log("🔍 Fetching unique animal bite patients...")
    const allPatients = await getAnimalbitePatients()
    const allReferrals = await getAnimalbiteReferrals()
    const allBiteDetails = await getAnimalbiteDetails()

    // Group patients by pat_id to avoid duplicates
    const uniquePatients = new Map()

    for (const patient of allPatients) {
      const patientId = patient.pat_details?.personal_info?.pat_id

      if (patientId && !uniquePatients.has(patientId)) {
        // Find all referrals for this patient
        const patientReferrals = allReferrals.filter((ref: any) => ref.patrec === patient.patrec_id)

        // Sort referrals by date (most recent first)
        const sortedReferrals = patientReferrals.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        // Get the most recent referral
        const mostRecentReferral = sortedReferrals[0]

        // Find bite details for the most recent referral
        const biteDetail = mostRecentReferral
          ? allBiteDetails.find((detail: any) => detail.referral === mostRecentReferral.referral_id)
          : null

        uniquePatients.set(patientId, {
          ...patient,
          recordCount: patientReferrals.length,
          mostRecentReferral,
          mostRecentBiteDetail: biteDetail,
          referrals: patientReferrals,
        })
      }
    }

    const result = Array.from(uniquePatients.values())
    console.log(`✅ Found ${result.length} unique animal bite patients`)
    return result
  } catch (error) {
    console.error("❌ Error fetching unique animal bite patients:", error)
    return []
  }
}

// Get all records for a specific patient by pat_id
export const getPatientRecordsByPatId = async (patId: string) => {
  try {
    console.log(`🔍 Fetching records for patient ID: ${patId}`)

    // Get all patient records for this pat_id
    const allPatients = await getAnimalbitePatients()
    const patientRecords = allPatients.filter(
      (patient: any) => patient.pat_details?.personal_info?.pat_id?.toString() === patId.toString(),
    )

    if (patientRecords.length === 0) {
      console.warn(`⚠️ No patient records found for patient ID: ${patId}`)
      throw new Error("Patient not found")
    }

    console.log(`✅ Found ${patientRecords.length} patient records for patient ID: ${patId}`)

    // Get all referrals for these patient records
    const allReferrals = await getAnimalbiteReferrals()
    const allBiteDetails = await getAnimalbiteDetails()

    // Get biting animals and exposure sites for enriching the data
    const bitingAnimals = await getBitingAnimals()
    const exposureSites = await getExposureSites()

    const patientData = []

    for (const patientRecord of patientRecords) {
      const patrecId = patientRecord.patrec_id

      // Find referrals for this patient record
      const referrals = allReferrals.filter((ref: any) => ref.patrec === patrecId)
      console.log(`✅ Found ${referrals.length} referrals for patient record ID: ${patrecId}`)

      for (const referral of referrals) {
        const biteDetail = allBiteDetails.find((detail: any) => detail.referral === referral.referral_id)

        if (biteDetail) {
          // Enrich with biting animal and exposure site data
          let bitingAnimal = biteDetail.biting_animal
          let exposureSite = biteDetail.exposure_site

          // If these are IDs, find the corresponding objects
          if (typeof bitingAnimal === "number") {
            const animal = bitingAnimals.find((a: any) => a.animal_id === bitingAnimal)
            if (animal) {
              bitingAnimal = animal
            }
          }

          if (typeof exposureSite === "number") {
            const site = exposureSites.find((s: any) => s.exposure_site_id === exposureSite)
            if (site) {
              exposureSite = site
            }
          }

          patientData.push({
            id: referral.referral_id,
            date: referral.date,
            transient: referral.transient,
            receiver: referral.receiver,
            sender: referral.sender,
            exposure: biteDetail.exposure_type,
            siteOfExposure: exposureSite,
            bitingAnimal: bitingAnimal,
            actions: biteDetail.actions_taken,
            referredBy: biteDetail.referrer_name || "N/A",
            lab_exam: biteDetail.lab_exam || "N/A",
            bite_id: biteDetail.bite_id,
            patientInfo: patientRecord.pat_details.personal_info,
          })
        }
      }
    }

    console.log(`✅ Processed ${patientData.length} records for patient ID: ${patId}`)

    return {
      patientInfo: patientRecords[0].pat_details.personal_info,
      records: patientData,
    }
  } catch (error) {
    console.error(`❌ Error fetching patient records for patient ID: ${patId}:`, error)
    throw error
  }
}

// Get all records for a specific referral ID
export const getPatientRecordsByReferralId = async (referralId: string) => {
  try {
    console.log(`🔍 Fetching records for referral ID: ${referralId}`)

    // Get the specific referral
    const allReferrals = await getAnimalbiteReferrals()
    const referral = allReferrals.find((ref: any) => ref.referral_id.toString() === referralId)

    if (!referral) {
      console.warn(`⚠️ No referral found with ID: ${referralId}`)
      throw new Error("Referral not found")
    }

    // Get the patient record associated with this referral
    const allPatients = await getAnimalbitePatients()
    const patientRecord = allPatients.find((patient: any) => patient.patrec_id === referral.patrec)

    if (!patientRecord) {
      console.warn(`⚠️ No patient record found for referral ID: ${referralId}`)
      throw new Error("Patient record not found")
    }

    // Get all bite details for this referral
    const allBiteDetails = await getAnimalbiteDetails()
    const biteDetail = allBiteDetails.find((detail: any) => detail.referral === parseInt(referralId))

    // Get biting animals and exposure sites for enriching the data
    const bitingAnimals = await getBitingAnimals()
    const exposureSites = await getExposureSites()

    // Enrich with biting animal and exposure site data
    let bitingAnimal = biteDetail?.biting_animal || "N/A"
    let exposureSite = biteDetail?.exposure_site || "N/A"

    // If these are IDs, find the corresponding objects
    if (typeof bitingAnimal === "number") {
      const animal = bitingAnimals.find((a: any) => a.animal_id === bitingAnimal)
      if (animal) {
        bitingAnimal = animal
      }
    }

    if (typeof exposureSite === "number") {
      const site = exposureSites.find((s: any) => s.exposure_site_id === exposureSite)
      if (site) {
        exposureSite = site
      }
    }

    // Format the data for the frontend
    const formattedData = {
      patientInfo: patientRecord.pat_details.personal_info,
      records: [{
        id: referral.referral_id,
        date: referral.date,
        transient: referral.transient,
        receiver: referral.receiver,
        sender: referral.sender,
        exposure: biteDetail?.exposure_type || "N/A",
        siteOfExposure: exposureSite,
        bitingAnimal: bitingAnimal,
        actions: biteDetail?.actions_taken || "N/A",
        referredBy: biteDetail?.referrer_name || "N/A",
        lab_exam: biteDetail?.lab_exam || "N/A",
        bite_id: biteDetail?.bite_id || 0,
      }]
    }

    console.log(`✅ Processed record for referral ID: ${referralId}`)
    return formattedData
  } catch (error) {
    console.error(`❌ Error fetching record for referral ID: ${referralId}:`, error)
    throw error
  }
}

// Fetch a single patient by ID
export const getPatientById = async (patientId: string) => {
  try {
    console.log(`🔍 Fetching patient with ID: ${patientId}`)
    const res = await api2.get(`patientrecords/patient/${patientId}/`)
    console.log("✅ Patient fetched successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Fetch Patient")
    return null
  }
}

// Create a new patient
export const createPatient = async (patientData: any) => {
  try {
    console.log("📝 Creating new patient:", patientData)
    const res = await api.post("patientrecords/patient/", patientData)
    console.log("✅ Patient created successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Create Patient")
    return null
  }
}

// Update an existing patient
export const updatePatient = async (patientId: string, patientData: any) => {
  try {
    console.log(`📝 Updating patient with ID: ${patientId}`, patientData)
    const res = await api.put(`patientrecords/patient/${patientId}/`, patientData)
    console.log("✅ Patient updated successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Update Patient")
    return null
  }
}

// Delete a patient
export const deletePatient = async (patientId: string) => {
  try {
    console.log(`🗑️ Deleting patient with ID: ${patientId}`)
    await api.delete(`patientrecords/patient/${patientId}/`)
    console.log("✅ Patient deleted successfully")
    return true
  } catch (error) {
    handleApiError(error, "Delete Patient")
    return false
  }
}

// Create a patient record
export const createPatientRecord = async (recordData: any) => {
  try {
    console.log("📝 Creating new patient record:", recordData)
    const res = await api.post("patientrecords/patient-record/", recordData)
    console.log("✅ Patient record created successfully:", res.data)
    return res.data
  } catch (error) {
    handleApiError(error, "Create Patient Record")
    return null
  }
}