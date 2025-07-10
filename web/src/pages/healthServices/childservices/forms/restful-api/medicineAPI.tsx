import { api2 } from "@/api/api"
import { createMedicineRecord, createPatientRecord } from "@/pages/healthServices/medicineservices/restful-api/postAPI"

export interface MedicineRequestData {
  pat_id: string
  medicines: {
    minv_id: string
    medrec_qty: number
    reason: string
  }[]
}

interface MedicineRequestResult {
  success: boolean
  medicineId?: string
  data?: any
  error?: string
}

export async function createChildMedicineRecord(payload: any): Promise<any> {
  try {
    console.log("Sending payload to /medicine/childmedicine/:", payload) // Log payload
    const res = await api2.post("/medicine/childmedicine/", payload)
    console.log("Response from /medicine/childmedicine/:", res.data) // Log response
    return res.data
  } catch (error) {
    console.error("Error creating child medicine record:", error)
    throw error
  }
}

export const processMedicineRequest = async (
  data: MedicineRequestData,
  staffId: string | null,
  chhistId?: string,
): Promise<MedicineRequestResult[]> => {
  const results: MedicineRequestResult[] = []
  console.log("Processing medicine request. isChildHealth:chhistId:", chhistId) // Log initial call
  for (const med of data.medicines) {
    try {
      // 1. Create patient record
      const patientRecord = await createPatientRecord(data.pat_id, "Medicine Record")
      if (!patientRecord?.patrec_id) {
        throw new Error("Failed to create patient record: No patrec_id returned")
      }

      const submissionData = {
        pat_id: data.pat_id,
        patrec_id: patientRecord.patrec_id,
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason || null,
        requested_at: new Date().toISOString(),
        fulfilled_at: new Date().toISOString(),
        staff: staffId || null,
        chhist:Number( chhistId) || null, // Include chhistId if provided
      }

      console.log(`Attempting to process medicine ${med.minv_id}. Submission data:`, submissionData) // Log submission data

      let response
        if (!chhistId) {
          throw new Error("chhistId is required for child health records when isChildHealth is true")
        }
        response = await createChildMedicineRecord(submissionData)
      

      results.push({
        success: true,
        medicineId: med.minv_id,
        data: response,
      })
    } catch (error) {
      const errorResult: MedicineRequestResult = {
        success: false,
        medicineId: med.minv_id,
        error: error instanceof Error ? error.message : "Unknown error",
      }
      results.push(errorResult)
      console.error(`Error processing medicine ${med.minv_id}:`, error)
    }
  }
  return results
}
