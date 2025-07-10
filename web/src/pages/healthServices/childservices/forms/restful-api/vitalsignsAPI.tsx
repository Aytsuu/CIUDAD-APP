import { api2 } from "@/api/api"

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

export async function updateChildHealthNotes(
  chnotesId: string,
  payload: Partial<{
    chn_notes: string
    updated_at: string
    followv: string | null
    staff: string | null
  }>,
) {
  try {
    const response = await api2.patch(`/child-health/notes/${chnotesId}/`, payload)
    console.log("Child health notes updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Child health notes update error:", error)
    throw new Error(`Failed to update child health notes: ${error instanceof Error ? error.message : "Unknown error"}`)
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

export async function updateChildVitalSign(
  chvitalId: string,
  payload: Partial<{
    temp: number | null
    bm: string
    updated_at: string
    chnotes: string
  }>,
) {
  try {
    const response = await api2.put(`/child-health/child-vitalsigns/${chvitalId}/`, payload)
    console.log("Vital signs record updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Vital signs update error:", error)
    throw new Error(`Failed to update vital signs record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

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

export async function updateNutritionalStatus(
  nutstatId: string,
  payload: Partial<{
    wfa: string
    lhfa: string
    wfl: string
    muac: string
    muac_status: string
    updated_at: string
    chvital: string
    edemaSeverity: string
  }>,
) {
  try {
    const response = await api2.put(`/child-health/nutritional-status/${nutstatId}/`, payload)
    console.log("Nutritional status record updated:", response.data)
    return response.data
  } catch (error) {
    console.error("Nutritional status update error:", error)
    throw new Error(`Failed to update nutritional status: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
