


import {api} from "@/api/api";


// export interface VaccinationPatientRecord {
//   pat_id: number;
//   fname: string;
//   lname: string;
//   mname: string;
//   sex: string;
//   age: string;
//   householdno: string;
//   street: string;
//   sitio: string;
//   barangay: string;
//   city: string;
//   province: string;
//   pat_type: string;
//   vaccination_count: number;
// }


export const getPatientRecord =  async () => {
  try {
    const response = await api.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};


export const getMedicalRecord =  async () => {
  try {
    const response = await api.get(`/medical-consultation/all-medical-consultation-record/`);
    return response.data;
  } catch (err) {
    console.error(err); 
  }
};



export const getMedconRecordById = async (id: number) => {
  try {
    const response = await api.get(`/medical-consultation/view-medcon-record/${id}/`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
}