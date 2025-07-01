"use client"

import { api2 } from "@/api/api"

export const getPatients = async () => {
  try {
      const res = await api2.get("patientrecords/patient/")
      return res.data;
  } catch (error) {
      console.error("Error:", error);
  }
}


export const getMaternalRecords = async () => {
  try {
    const res = await api2.get("maternal/maternal-patients/")
    return res.data.patients || [];
  } catch (error) {
    console.error("Error fetching maternal records: ", error);
    throw error;
  }
}


export const getPatientPostpartumCount = async (patientId: string): Promise<number> => {
  try {
    console.log("Fetching postpartum count for patient:", patientId)
    const res = await api2.get(`maternal/patient/${patientId}/postpartum_count/`)

    console.log("Postpartum count response:", res.data)
    return res.data.postpartum_count || 0
  } catch (error) {
    if (error) {
      console.error("Get Patient Postpartum Count Error:", (error as any)?.data || (error as any)?.message)

      // If patient not found or no records, return 0
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as any).response &&
        (error as any).response.status === 404
      ) {
        return 0
      }
    } else {
      console.error("Unexpected Error:", error)
    }

    // Return 0 on error to prevent UI issues
    return 0
  }
}