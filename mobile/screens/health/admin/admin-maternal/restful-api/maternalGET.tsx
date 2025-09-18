import { api2 } from "@/api/api"

// maternal records
export const getMaternalRecords = async () => {
  try {
    const res = await api2.get("maternal/maternal-patients/")
    return res.data || [];
  } catch (error) {
    console.error("Error fetching maternal records: ", error);
    throw error;
  }
}

// active pregnancies count
export const getActivePregnanciesCount = async () => {
  try {
    const res = await api2.get("maternal/pregnancy_count/")
    return res.data.active_pregnancy_count || 0;
  } catch (error) {
    console.error("Error fetching active pregnancies count: ", error);
    throw error;
  }
}