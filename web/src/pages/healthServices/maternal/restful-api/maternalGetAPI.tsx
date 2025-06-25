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