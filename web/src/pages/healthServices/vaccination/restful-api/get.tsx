


import {api2} from "@/api/api";



// Helper function to get vaccine stock info
export const getVaccineStock = async (vaccineTypeId: string) => {
  const vacStck_id = parseInt(vaccineTypeId, 10);
  const response = await api2.get(`inventory/vaccine_stocks/${vacStck_id}/`);
  return response.data;
};


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


export const getPatient =  async () => {
  try {
    const response = await api2.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};


export const getVaccinationRecords =  async () => {
  try {
    const response = await api2.get(`/vaccination/all-vaccine-records/`);
    return response.data;
  } catch (err) {
    console.error(err); 
  }
};

export const getVaccinationRecordById =  async (id: string) => {
  try {
    const response = await api2.get(`/vaccination/indiv-patient-record/${id}/`);
    console.log("API Response:", response); // Add logging
    if (!response.data) {
      throw new Error("No data returned from API");
    }
    return response.data;
  } catch (err) {
    console.error(err);
  }
}

export const getVaccinationCount = async (patId: string) => {
  try {
    const response = await api2.get(`/vaccination/vacrec-count/${patId}/`);
    return response.data.vaccination_count;
  } catch (err) {
    console.error("Failed to fetch vaccination count:", err);
    return 0; // or throw if you want error handling on the UI
  }
};

  export const getVaccintStocks =  async () => {
      try {
          const response = await api2.get(`/inventory/vaccine_stocks/`);
          return response.data;
      } catch (err) {
          console.error(err);
      }
  }


export const getVaccinelist =  async () => {
    try {
        const response = await api2.get(`/inventory/vac_list`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
    }



   
export const getSpecificVaccintStocks =  async (vac_id:number) => {
  try {
      const response = await api2.get(`/inventory/vaccine_stocks_vac/${vac_id}/`);
      return response.data;
  } catch (err) {
      console.error(err);
  }
}


export const getVaccinationHistory =  async () => {
  try {
      const response = await api2.get(`/vaccination/vaccination-history/`);
      return response.data;
  } catch (err) {
      console.error(err);
  }   
}
    
export const getVaccinatedCount = async () => {
  try {
    const response = await api2.get('/vaccination/count-vaccinated/');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch vaccinated count:", error);
    throw error;
  }
};



export const getUnvaccinatedResidents = async () => {
  try {
    const response = await api2.get("/vaccination/residents/unvaccinated/");
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch unvaccinated residents:", error);
    throw error;
  }
};


export const getUnvaccinatedVaccines = async (patientId: string) => {
  try {
    const response = await api2.get(`/vaccination/unvaccinated-vaccines/${patientId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unvaccinated vaccines:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};
