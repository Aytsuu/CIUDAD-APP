import { api2 } from "@/api/api";

// Medical History API
export const createMedicalHistory = async (
  data: Array<{
    patrec: number;
    ill: number;
    medrec: number;
    created_at: string;
  }>
) => {
  try {
    await api2.post("patientrecords/medical-history/", data);
    return true;
  } catch (error) {
    console.error("Error creating medical history:", error);
    throw error;
  }
};

export const deleteMedicalHistory = async (medrec_id: string) => {
  try {
    await api2.delete(`patientrecords/medical-history/${medrec_id}`);
  } catch (error) {
    console.error("Error deleting medical history:", error);
    throw error;
  }
};

// Medical Consultation API
export const updateMedicalConsultation = async (
  medrec_id: string,
  status: string,
  findingId?: number,
  medreq?: number,
  followv?: string
) => {
  try {
    const response = await api2.patch(
      `medical-consultation/update-medcon/${medrec_id}/`,
      {
        medrec_status: status,
        find: findingId || null,
        medreq: medreq,
        followv: Number(followv),
      }
    );
    if (!response.data) {
      throw new Error("Failed to update medical consultation record");
    }
    return response.data;
  } catch (error) {
    console.error("Error updating medical consultation:", error);
    throw error;
  }
};

export const createFollowUpVisit = async (
  patrec_id: number,
  followv_date: string
) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", {
      followv_date,
      patrec: patrec_id,
      followv_status: "pending",
      followv_description: "Follow up Shedule for Medical Consultation",
      created_at: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(error);
    // Re-throw other errors
    throw error;
  }
};
