import { api2 } from "@/api/api"

// --- Child Health Record (chrec) Operations ---

export async function createChildHealthRecord(payload: {
  // chr_date: string
  ufc_no: string
  family_no: string
  place_of_delivery_type: string
  pod_location: string
  mother_occupation: string
  type_of_feeding: string
  father_occupation: string
  birth_order: number
  newborn_screening: string
  staff: string | null
  patrec: string
}) {
  try {
    const response = await api2.post("child-health/records/", payload)
    if (!response.data.chrec_id) {
      throw new Error("Failed to create child health record: No ID returned")
    }
    console.log("Child health record created:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating child health record:", error)
    throw new Error(`Failed to create child health record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}


// --- Child Health History (chhist) Operations ---

export async function createChildHealthHistory(payload: {
  created_at: string
  chrec: string
  status: string
  tt_status: string
}) {
  try {
    const response = await api2.post("child-health/history/", payload)
    if (!response.data.chhist_id) {
      throw new Error("Failed to create child health history: No ID returned")
    }
    console.log("Child health history created:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating child health history:", error)
    throw new Error(
      `Failed to create child health history: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function updateChildHealthHistory(
  chhistId: string,
  payload: Partial<{
    status: string
    tt_status: string
    updated_at: string
  }>,
) {
  try {
    const response = await api2.patch(`/child-health/history/${chhistId}/`, payload)
    console.log("Child health history status updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Error updating child health history status:", error)
    throw new Error(
      `Failed to update child health history status: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function getChildHealthRecordById(chhistId: string) {
  try {
    const response = await api2.get(`/child-health/historyindiv/${chhistId}/`)
    console.log("API Response (raw data received):", response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching record data:", error)
    throw new Error(`Failed to load record data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// --- Exclusive Breastfeeding Check Operations ---

export async function createExclusiveBFCheck(payload: {
  chhist: string
  ebf_date: string
  created_at: string
}) {
  try {
    const response = await api2.post("child-health/exclusive-bf-check/", payload)
    console.log("Exclusive BF check created:", response.data)
    return response.data
  } catch (error) {
    console.error("Exclusive BF check creation error:", error)
    throw new Error(
      `Failed to create exclusive breastfeeding check: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

// --- Supplement Status (Anemic, Birth Weight) Operations ---

export async function createSupplementStatus(payload: {
  status_type: string
  date_seen: string | null
  date_given_iron: string | null
  chhist: string
  created_at: string
  updated_at?: string
  birthwt: number
   date_completed : string | null

 
}) {
  try {
    const response = await api2.post("child-health/supplement-status/", payload)
    console.log(`New ${payload.status_type} status created:`, response.data)
    return response.data
  } catch (error) {
    console.error(`Error creating ${payload.status_type} status:`, error)
    throw new Error(
      `Failed to create ${payload.status_type} status: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function updateSupplementStatus(
  suppstatId: string,
  payload: Partial<{
    status_type: string
    date_seen: string | null
    date_given_iron: string | null
    chhist: string
    updated_at: string
    birthwt:string
  }>,
) {
  try {
    const response = await api2.put(`/child-health/supplement-status/${suppstatId}/`, payload)
    console.log("Supplement status updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Error updating supplement status:", error)
    throw new Error(`Failed to update supplement status: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteSupplementStatus(suppstatId: string) {
  try {
    await api2.delete(`/child-health/supplement-status/${suppstatId}/`)
    console.log("Supplement status deleted.")
  } catch (error) {
    console.error("Error deleting supplement status:", error)
    throw new Error(`Failed to delete supplement status: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// --- Child Health Supplements (Medicines) Operations ---

export async function createChildHealthSupplement(payload: {
  chhist: string
  medrec: string
}) {
  try {
    const response = await api2.post("child-health/supplements/", payload)
    if (!response.data.chsupplement_id) {
      throw new Error("Failed to create supplement record for medicine: No ID returned")
    }
    console.log("Supplement record created:", response.data)
    return response.data
  } catch (error) {
    console.error("Error creating supplement record:", error)
    throw new Error(`Failed to create supplement record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteChildHealthSupplement(chsupplementId: string) {
  try {
    await api2.delete(`/child-health/supplements/${chsupplementId}/`)
    console.log("Child health supplement deleted.")
  } catch (error) {
    console.error("Error deleting child health supplement:", error)
    throw new Error(
      `Failed to delete child health supplement: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
