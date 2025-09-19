import { api2 } from "@/api/api"

// --- Patient Record Operations ---
export async function deleteFollowUpVisit(followvId: string) {
  try {
    await api2.delete(`/patientrecords/follow-up-visit/${followvId}/`)
    console.log("Follow-up visit deleted.")
  } catch (error) {
    console.error("Error deleting follow-up visit:", error)
    throw new Error(`Failed to delete follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

