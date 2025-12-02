import { api2 } from "@/api/api"

// active pregnancies count
export const getMaternalCount = async () => {
  try {
    const res = await api2.get("maternal/counts/")
    return res.data || 0;
  } catch (error) {
    console.error("Error fetching active pregnancies count: ", error);
    throw error;
  }
}


// postpartum form complete record
export const getPatientPostpartumAllRecords = async (pregnancyId: string) => {
  try {
    const res = await api2.get(`maternal/postpartum/${pregnancyId}/all/`)
    return res.data || []
  } catch (error) {
    console.error("Error fetching patient postpartum all records: ", error);
    throw error;
  }
}

export const getPatientPostpartumCompleteRecord = async (pprId: string) => {
  try {
    const res = await api2.get(`maternal/postpartum/${pprId}/complete/`)
    return res.data || []
  } catch (error) {
    console.error("Error fetching patient postpartum complete record: ", error);
    throw error;
  }
}

// prenatal form complete record
export const getPrenatalRecordComplete = async (patientId: string) => {
  try {
    const res = await api2.get(`maternal/prenatal/${patientId}/complete/`)
    return res.data || [];
  } catch (error) {
    console.error("Error fetching prenatal record complete: ", error);
    throw error;
  }
} 