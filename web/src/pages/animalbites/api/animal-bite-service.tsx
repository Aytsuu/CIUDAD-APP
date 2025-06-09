// import { api } from "@/api/api"

// // Helper function for consistent error handling
// const handleApiError = (err: any, operation: string) => {
//   if (err.response) {
//     console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
//   } else {
//     console.error(`❌ Unexpected ${operation} Error:`, err)
//   }
//   throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
// }

// // Fetch all animal bite patients
// export const getAnimalbitePatients = async () => {
//   try {
//     console.log("🔍 Fetching animal bite patients...")
//     const res = await api.get("patientrecords/patient-record")
//     const allPatients = res.data

//     // Filter only Animal Bite records
//     const animalBitePatients = allPatients.filter((patient: any) => patient.patrec_type === "Animal Bites")
//     console.log(`✅ Found ${animalBitePatients.length} animal bite patients`)

//     return animalBitePatients
//   } catch (error) {
//     console.error("❌ Error fetching animal bite patients:", error)
//     return []
//   }
// }

// // Fetch all animal bite referrals
// export const getAnimalbiteReferrals = async () => {
//   try {
//     console.log("🔍 Fetching animal bite referrals...")
//     const res = await api.get("animalbites/referral/")
//     console.log(`✅ Found ${res.data.length} animal bite referrals`)
//     return res.data
//   } catch (error) {
//     console.error("❌ Error fetching animal bite referrals:", error)
//     return []
//   }
// }

// // Fetch all animal bite details
// export const getAnimalbiteDetails = async () => {
//   try {
//     console.log("🔍 Fetching animal bite details...")
//     const res = await api.get("animalbites/details/")
//       return res
//       console
//     }
//     catch (error) {
//     console.error("❌ Error fetching animal bite details:", error)
//     return []
//   }
// }

// // Get unique patients (no duplicates) for the overall table
// export const getUniqueAnimalbitePatients = async () => {
//   try {
//     console.log("🔍 Fetching unique animal bite patients...")
//     const allPatients = await getAnimalbitePatients()
//     const allReferrals = await getAnimalbiteReferrals()
//     const allBiteDetails = await getAnimalbiteDetails()

//     // Group patients by pat_id to avoid duplicates
//     const uniquePatients = new Map()

//     for (const patient of allPatients) {
//       const patientId = patient.pat_details?.personal_info?.pat_id

//       if (patientId && !uniquePatients.has(patientId)) {
//         // Find all referrals for this patient
//         const patientReferrals = allReferrals.filter((ref: any) => ref.patrec === patient.patrec_id)

//         // Sort referrals by date (most recent first)
//         const sortedReferrals = patientReferrals.sort(
//           (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
//         )

//         // Get the most recent referral
//         const mostRecentReferral = sortedReferrals[0]

//         // Find bite details for the most recent referral
//         const biteDetail = mostRecentReferral
//           ? allBiteDetails.find((detail: any) => detail.referral === mostRecentReferral.referral_id)
//           : null

//         uniquePatients.set(patientId, {
//           ...patient,
//           recordCount: patientReferrals.length,
//           mostRecentReferral,
//           mostRecentBiteDetail: biteDetail,
//         })
//       }
//     }

//     const result = Array.from(uniquePatients.values())
//     console.log(`✅ Found ${result.length} unique animal bite patients`)
//     return result
//   } catch (error) {
//     console.error("❌ Error fetching unique animal bite patients:", error)
//     return []
//   }
// }

// // Get all records for a specific patient by pat_id
// export const getPatientRecordsByPatId = async (patId: string) => {
//   try {
//     console.log(`🔍 Fetching records for patient ID: ${patId}`)

//     // Get all patient records for this pat_id
//     const allPatients = await getAnimalbitePatients()
//     const patientRecords = allPatients.filter(
//       (patient: any) => patient.pat_details?.personal_info?.pat_id?.toString() === patId.toString(),
//     )

//     if (patientRecords.length === 0) {
//       console.warn(`⚠️ No patient records found for patient ID: ${patId}`)
//       throw new Error("Patient not found")
//     }

//     console.log(`✅ Found ${patientRecords.length} patient records for patient ID: ${patId}`)

//     // Get all referrals for these patient records
//     const allReferrals = await getAnimalbiteReferrals()
//     const allBiteDetails = await getAnimalbiteDetails()

//     const patientData = []

//     for (const patientRecord of patientRecords) {
//       const patrecId = patientRecord.patrec_id

//       // Find referrals for this patient record
//       const referrals = allReferrals.filter((ref: any) => ref.patrec === patrecId)
//       console.log(`✅ Found ${referrals.length} referrals for patient record ID: ${patrecId}`)

//       for (const referral of referrals) {
//         const biteDetail = allBiteDetails.find((detail: any) => detail.referral === referral.referral_id)

//         if (biteDetail) {
//           // Enrich with biting animal and exposure site data
//           let bitingAnimal = biteDetail.biting_animal
//           let exposureSite = biteDetail.exposure_site

          

//           patientData.push({
//             id: referral.referral_id,
//             date: referral.date,
//             transient: referral.transient,
//             receiver: referral.receiver,
//             sender: referral.sender,
//             exposure: biteDetail.exposure_type,
//             siteOfExposure: exposureSite,
//             bitingAnimal: bitingAnimal,
//             actions: biteDetail.actions_taken,
//             referredBy: biteDetail.referredby,
//             lab_exam: biteDetail.lab_exam || "N/A",
//             bite_id: biteDetail.bite_id,
//             patientInfo: patientRecord.pat_details.personal_info,
//           })
//         }
//       }
//     }

//     console.log(`✅ Processed ${patientData.length} records for patient ID: ${patId}`)

//     return {
//       patientInfo: patientRecords[0].pat_details.personal_info,
//       records: patientData,
//     }
//   } catch (error) {
//     console.error(`❌ Error fetching patient records for patient ID: ${patId}:`, error)
//     throw error
//   }
// }
