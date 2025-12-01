import { api2 } from "@/api/api"

// --- Patient Record Operations ---
export async function deleteFollowUpVisit(followvId: string) {
  try {
    await api2.delete(`/patientrecords/follow-up-visit/${followvId}/`)
  } catch (error) {
    throw new Error(`Failed to delete follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

