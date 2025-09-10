import { api2 } from "@/api/api";

export const getPreviousBMI = async (id: string) => {
  try {
    const res = await api2.get(`/patientrecords/previous-measurement/${id}/`);

    return res.data;
  } catch (err:any) {
    console.error("Error fetching previous BMI:", err);
    if (err.response?.status === 404) {
      return null; // Return null instead of throwing error
    }

    throw err;
  }
};

export const getPatient = async () => {
  try {
    const response = await api2.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const getMedicalRecord = async () => {
  try {
    const response = await api2.get(`/medical-consultation/all-medical-consultation-record/`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const getMedconRecordById = async (id: string) => {
  try {
    const response = await api2.get(`/medical-consultation/view-medcon-record/${id}/`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};
