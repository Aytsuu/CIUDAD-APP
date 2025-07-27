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

// maternal-records
export const getMaternalRecords = async () => {
  try {
    const res = await api2.get("maternal/maternal-patients/")
    return res.data.patients || [];
  } catch (error) {
    console.error("Error fetching maternal records: ", error);
    throw error;
  }
}

// prenatal record count
export const getPatientPrenatalCount = async (patientId: string): Promise<number> => {
  try {
    const res = await api2.get(`maternal/patient/${patientId}/prenatal_count`)

    console.log("Prenatal count response: ", res.data)
    return res.data.prenatal_count || 0

  } catch (error) {
    if(error){
      console.error("Patient prenatal count fetching error: ", (error as any)?.data || (error as any)?.message)

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
    return 0
  }
} 

// postpartum record count
export const getPatientPostpartumCount = async (patientId: string): Promise<number> => {
  try {
    console.log("Fetching postpartum count for patient:", patientId)
    const res = await api2.get(`maternal/patient/${patientId}/postpartum_count/`)

    console.log("Postpartum count response:", res.data)
    return res.data.postpartum_count || 0

  } catch (error) {
    if (error) {
      console.error("Get Patient Postpartum Count Error:", (error as any)?.data || (error as any)?.message)

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

    return 0
  }
}

export const getActivePregnanciesCount = async () => {
  try {
    const res = await api2.get("maternal/pregnancy_count/")
    return res.data.active_pregnancy_count || 0;
  } catch (error) {
    console.error("Error fetching active pregnancies count: ", error);
    throw error;
  }
}

// pregnancy details
export const getPregnancyDetails = async (patientId: string) => {
  try {
    const res = await api2.get(`maternal/pregnancy/${patientId}/details/`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching pregnancy details: ", error);
    throw error;
  }
}

// medical history for prenatal form
export const getPrenatalPatientMedHistory = async (patientId: string) => {
  try { 
    const res = await api2.get(`maternal/patient/${patientId}/medicalhistory`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal patient medical history: ", error);
    throw error;
  }
}

// obstetric history for prenatal form
export const getPrenatalPatientObsHistory = async (patientId: string) => {
  try {
    const res = await api2.get(`maternal/patient/${patientId}/obstetricalhistory`)
    return res.data || []
  } catch (error) {
    console.error("Error fetching prenatal patient obstetrical history: ", error);
    throw error;
  }
}

// body measurement for prenatal and postpartum form
export const getPrenatalPatientBodyMeasurement = async (patientId: string) => {
  try {
    const res = await api2.get(`maternal/patient/${patientId}/bodymeasurement`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal patient body measurement: ", error);
    throw error;
  }
}

// follow-up visits for prenatal
export const getPrenatalPatientFollowUpVisits = async (patientId: string) => {
  try {
    const res = await api2.get(`maternal/patient/${patientId}/followupvisits`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal patient follow-up visits: ", error);
    throw error;
  }
}

// previous hospitalization for prenatal
export const getPrenatalPatientPrevHospitalization = async (patientId: string)  => {
  try {
    const res = await api2.get(`maternal/patient/${patientId}/previoushospitalization/`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal patient previous hospitalization: ", error);
    throw error;
  }
}

// previous pregnancy for prenatal
export const getPrenatalPatientPrevPregnancy = async (patientId: string) => {
  try { 
    const res = await api2.get(`maternal/patient/${patientId}/previouspregnancy/`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal patient previous pregnancy: ", error);
    throw error;
  }
}