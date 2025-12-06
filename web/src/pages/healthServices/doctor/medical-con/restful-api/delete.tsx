import { api2 } from "@/api/api";

export const deleteFindings = async (findingId: string) => {
  try {
    await api2.delete(`patientrecords/findings/${findingId}/`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting findings:", error);
    }
    return null;
  }
};

export const deleteMedicalHistory = async (patrec: string) => {
  try {
    await api2.delete(`patientrecords/medical-history/${Number(patrec)}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting medical history:", error);
    }
    return null;
  }
};

export const deleteMedicineRequest = async (medRequestId: number) => {
  try {
    await api2.delete(`medicine/medicine-request/${medRequestId}/`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting medicine request:", error);
    }
    return null;
  }
};

export const deletePEResults = async (findingId: string) => {
  try {
    await api2.delete(`patientrecords/physical-exam-results/${findingId}/`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting PE results:", error);
    }
    return null;
  }
};

export const deleteNotes = async (chnotes_id: string) => {
  try {
    await api2.delete(`child-health/delete/notes/${chnotes_id}/`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting PE results:", error);
    }
    return null;
  }
};
