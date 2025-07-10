import { api2 } from "@/api/api"

// --- Patient Record Operations ---

export async function createPatientRecord(payload: {
  patrec_type: string
  pat_id: string
  created_at: string
}) {
  try {
    const response = await api2.post("patientrecords/patient-record/", payload)
    if (!response.data.patrec_id) {
      throw new Error("Failed to create patient record: No ID returned")
    }
    console.log("Patient record created:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating patient record:", error)
    throw new Error(`Failed to create patient record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updatePatientRecord(
  patrecId: string,
  payload: Partial<{
    patrec_type: string
    pat_id: string
    updated_at: string
  }>,
) {
  try {
    const response = await api2.patch(`/patientrecords/patient-record/${patrecId}/`, payload)
    console.log("Patient record (patrec) updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Error updating patient record (patrec):", error)
    throw new Error(`Failed to update patient record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// --- Transient Patient Operations ---

export async function updateTransientPatient(
  transId: string,
  payload: Partial<{
    mother_fname: string | null
    mother_lname: string | null
    mother_mname: string | null
    mother_age: string | null
    mother_dob: string | null
    father_fname: string | null
    father_lname: string | null
    father_mname: string | null
    father_age: string | null
    father_dob: string | null
    updated_at: string
  }>,
) {
  try {
    const response = await api2.patch(`patientrecords/update-transient/${transId}/`, payload)
    if (response.status !== 200) {
      throw new Error("Failed to update transient information")
    }
    console.log("Transient updated successfully:", response.data)
    return response.data
  } catch (error) {
    console.error("Transient update error:", error)
    throw new Error(`Failed to update transient: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}



// --- Follow-up Visit Operations ---

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

export async function updateFollowUpVisit(
  followvId: string,
  payload: Partial<{
    followv_date: string | null
    followv_description: string | null
    updated_at: string
    patrec: string
    followv_status: string
  }>,
) {
  try {
    const response = await api2.put(`/patientrecords/follow-up-visit/${followvId}/`, payload)
    console.log("Follow-up visit updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Follow-up visit update error:", error)
    throw new Error(`Failed to update follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteFollowUpVisit(followvId: string) {
  try {
    await api2.delete(`/patientrecords/follow-up-visit/${followvId}/`)
    console.log("Follow-up visit deleted.")
  } catch (error) {
    console.error("Error deleting follow-up visit:", error)
    throw new Error(`Failed to delete follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// --- Body Measurements (BMI) Operations ---

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

export async function updateBodyMeasurement(
  bmId: string,
  payload: Partial<{
    age: string
    height: number | null
    weight: number | null
    updated_at: string
    patrec: string
    staff: string | null
  }>,
) {
  try {
    const response = await api2.put(`/patientrecords/body-measurements/${bmId}/`, payload)
    console.log("BMI record updated:", response.data)
    return response.data
  } catch (error) {
    console.error("BMI record update error:", error)
    throw new Error(`Failed to update BMI record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// --- Patient Disability Operations ---

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


export async function updatePatientDisabilityStatus(payload: {
  pd_id: number
  disability_id?: string
  patrec_id?: string
}[]) {
  try {
    const updatedPayload = payload.map(item => ({
      ...item,
      updated_at: new Date().toISOString(),
    }));
    const response = await api2.patch("patientrecords/patient-disability/", updatedPayload);
    console.log("Disabilities updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Failed to update disabilities:", error)
    throw new Error(
      `Failed to update disabilities: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}
