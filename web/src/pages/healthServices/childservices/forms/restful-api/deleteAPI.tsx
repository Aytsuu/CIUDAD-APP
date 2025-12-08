import { api2 } from "@/api/api"

// --- Patient Record Operations ---
export async function deleteFollowUpVisit(followvId: string) {
  try {
    await api2.delete(`/patientrecords/follow-up-visit/${followvId}/`)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error(error);
    return null;
  }
}

