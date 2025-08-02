


import {api2} from "@/api/api";





export const previousBMI = async (pat_id: string) => {
  try {
    const res = await api2.get(`/patientrecords/previous-measurement/${pat_id}/`);
    return res.data;
  } catch (err) {
    console.error("Error fetching previous BMI:", err);
    throw err;
  }
};


export const getPatient =  async () => {
  try {
    const response = await api2.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};



export const getMedicalRecord =  async () => {
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
}