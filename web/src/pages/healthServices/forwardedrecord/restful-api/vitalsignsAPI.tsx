import { api2 } from "@/api/api";

export const updateVitalSigns = async (
  vitalId: number,
  updatedData: Record<string, any>
) => {
  try {
    const response = await api2.patch(
      `/patientrecords/vitals-signs/${vitalId}/`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vital signs:", error);
    throw error;
  }
};



export const updateVacRecord = async (vacrec_id: number) => {
  try {
    const response = await api2.patch(
      `/vaccination/vaccination-record/${vacrec_id}/`,
      { updated_at: new Date().toISOString() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vital signs:", error);
    throw error;
  }
};

//   VaccinationRecord
