


import {api} from "@/api/api";


export interface VaccinationPatientRecord {
  pat_id: number;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
  vaccination_count: number;
}


export const getPatientRecord =  async () => {
  try {
    const response = await api.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};


export const getVaccinationRecords =  async () => {
  try {
    const response = await api.get(`/vaccination/all-vaccine-records/`);
    return response.data;
  } catch (err) {
    console.error(err); 
  }
};


export const getVaccinationRecordById =  async (id: number) => {
  try {
    const response = await api.get(`/vaccination/indiv-patient-record/${id}/`);
    console.log("API Response:", response); // Add logging
    if (!response.data) {
      throw new Error("No data returned from API");
    }
    return response.data;
  } catch (err) {
    console.error(err);
  }
}




  export const getVaccintStocks =  async () => {
      try {
          const response = await api.get(`/inventory/vaccine_stocks/`);
          return response.data;
      } catch (err) {
          console.error(err);
      }
  }




export const getVaccinelist =  async () => {
    try {
        const response = await api.get(`/inventory/vac_list`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
    }



   
    export const getSpecificVaccintStocks =  async (vac_id:number) => {
      try {
          const response = await api.get(`/inventory/vaccine_stocks_vac/${vac_id}/`);
          return response.data;
      } catch (err) {
          console.error(err);
      }
  }

    