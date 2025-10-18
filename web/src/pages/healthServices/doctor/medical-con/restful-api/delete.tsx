import { api2 } from "@/api/api";

export const deleteFindings = async (findingId: string) => {
  try {
    await api2.delete(`patientrecords/findings/${findingId}/`);
  } catch (error) {
    console.error("Error deleting findings:", error);
    throw error;
  }
};

export const deleteMedicalHistory = async (patrec: string) => {
  try {
    await api2.delete(`patientrecords/medical-history/${Number(patrec)}`);
  } catch (error) {
    console.error("Error deleting medical history:", error);
    throw error;
  }
};

export const deleteMedicineRequest = async (medRequestId: number) => {
  try {
    await api2.delete(`medicine/medicine-request/${medRequestId}/`);
  } catch (error) {
    console.error("Error deleting medicine request:", error);
    throw error;
  }
};

export const deletePEResults = async (findingId: string) => {
  try {
    await api2.delete(`patientrecords/physical-exam-results/${findingId}/`);
  } catch (error) {
    console.error("Error deleting PE results:", error);
    throw error;
  }
};

export const deleteNotes = async (chnotes_id: string) => {
  try {
    await api2.delete(`child-health/delete/notes/${chnotes_id}/`);
  } catch (error) {
    console.error("Error deleting PE results:", error);
    throw error;
  }
};
