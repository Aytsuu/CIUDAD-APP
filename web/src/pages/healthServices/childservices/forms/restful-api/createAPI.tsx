import { api2 } from "@/api/api";
import { createMedicineRecord } from "@/pages/healthServices/medicineservices/restful-api/postAPI"
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";


// --- Nutritional Status Operations ---

export async function createNutritionalStatus(payload: {
    wfa: string
    lhfa: string
    wfl: string // maps to wfh in frontend
    muac: string
    muac_status: string
    created_at: string
    chvital: number
    edemaSeverity: string
  }) {
    try {
      const response = await api2.post("child-health/nutritional-status/", payload)
      if (!response.data.nutstat_id) {
        throw new Error("Failed to create nutritional status record: No ID returned")
      }
      console.log("Nutritional status record created:", response.data)
      return response.data
    } catch (error) {
      console.error("Nutritional status creation error:", error)
      throw new Error(`Failed to create nutritional status: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  

// --- Child Vital Signs Operations ---

export async function createChildVitalSign(payload: {
    temp: number | null
    bm: string
    chhist: string
    created_at: string
  }) {
    try {
      const response = await api2.post("child-health/child-vitalsigns/", payload)
      if (!response.data.chvital_id) {
        throw new Error("Failed to create vital signs record: No ID returned")
      }
      console.log("Vital signs record created:", response.data)
      return response.data
    } catch (error) {
      console.error("Vital signs creation error:", error)
      throw new Error(`Failed to create vital signs record: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  

// --- Child Health Notes Operations ---

export async function createChildHealthNotes(payload: {
    chn_notes: string
    created_at: string
    updated_at: string
    followv: string | null
    chhist: string,
    staff: string | null
  }) {
    try {
      const response = await api2.post("child-health/notes/", payload)
      if (!response.data.chnotes_id) {
        throw new Error("Failed to create child health notes: No ID returned")
      }
      console.log("Child health notes created:", response.data)
      return response.data
    } catch (error) {
      console.error("Error creating child health notes:", error)
      throw new Error(`Failed to create child health notes: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  
export async function createBodyMeasurement(payload: {
    age: string
    height: number | null
    weight: number | null
    created_at: string
    patrec: string
    staff: string | null
  }) {
    try {
      const response = await api2.post("patientrecords/body-measurements/", payload)
      if (!response.data.bm_id) {
        throw new Error("Failed to create BMI record: No ID returned")
      }
      console.log("BMI record created:", response.data)
      return response.data
    } catch (error) {
      console.error("BMI record creation error:", error)
      throw new Error(`Failed to create BMI record: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  
export async function createPatientDisability(payload: {
    patrec: string
    disabilities: string[]
  }) {
    try {
      const response = await api2.post("patientrecords/patient-disability/", payload)
      console.log("Disabilities linked:", response.data)
      return response.data
    } catch (error) {
      console.error("Failed to link disabilities:", error)
      throw new Error(`Failed to link disabilities: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
  
  
  
export async function createFollowUpVisit(payload: {
    followv_date: string | null
    created_at: string
    followv_description: string
    patrec: string
    followv_status: string
    updated_at: string
  }) {
    try {
      const response = await api2.post("patientrecords/follow-up-visit/", payload)
      if (!response.data.followv_id) {
        throw new Error("Failed to create follow-up record: No ID returned")
      }
      console.log("Follow-up visit created:", response.data)
      return response.data
    } catch (error) {
      console.error("Follow-up visit creation error:", error)
      throw new Error(`Failed to create follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
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
    data: any,
    staffId: string | null,
    chhistId?: string,
  ): Promise<any[]> => {
    const results: any[] = []
    console.log("Processing medicine request. isChildHealth:chhistId:", chhistId) // Log initial call
    for (const med of data.medicines) {
      try {
        // 1. Create patient record
        const patientRecord = await createPatientRecord(data.pat_id, "Medicine Record",staffId)
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
        const errorResult: any = {
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
  