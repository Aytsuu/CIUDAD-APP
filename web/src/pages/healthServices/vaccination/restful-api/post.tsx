import { api2 } from "@/api/api";
import axios, { AxiosError } from 'axios';

// Helper function to get vaccine stock info
export const getVaccineStock = async (vaccineTypeId: string) => {
  const vacStck_id = parseInt(vaccineTypeId, 10);
  const response = await api2.get(`inventory/vaccine_stocks/${vacStck_id}/`);
  return response.data;
};



export const createVaccinationRecord = async (
  patrec_id: string,
  staff_id: string | null = null,
  // status: "forwarded" | "completed" | "partially vaccinated",
  totalDoses: number
) => {
  const parsedPatrecId = parseInt(patrec_id, 10);
  const response = await api2.post("vaccination/vaccination-record/", {
    patrec_id: parsedPatrecId,
    // vacrec_status: status,
    vacrec_totaldose: totalDoses,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    staff: staff_id || null, // Ensure staff_id is parsed as an integer
  });
  return response.data;
};



export const createVaccinationHistory = async (
  vacrec_id: string,
  data: Record<string, any>,
  vacStck_id: string,
  doseNo: number,
  status: "forwarded" | "completed" | "partially vaccinated" | "scheduled",
  age:string,
  staff_id: string | null,
  vital_id?: string | null,
  followv_id?: string | null ,
  
) => {
  try {
    const response = await api2.post("vaccination/vaccination-history/", {
      vachist_doseNo: doseNo,
      vachist_status: status,
      vachist_age: age,
      staff: staff_id,
      vacrec: vacrec_id,
      vital: vital_id,
      created_at: new Date().toISOString(),
      vacStck_id: parseInt(vacStck_id, 10),
      assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
      followv: followv_id,
      // staff:staff_id|| null
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle 400 Bad Request specifically
      if (error.response?.status === 400) {
        console.error("Bad Request Details:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        // Extract validation errors if available
        const validationErrors = error.response.data;
        throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
      }

      // Handle other HTTP errors
      console.error("API Error:", {
        message: error.message,
        code: error.code,
        config: error.config,
      });
    } else {
      console.error("Unexpected Error:", error);
    }

    throw error; // Re-throw for calling code
  }
};

export const createVitalSigns = async (data: Record<string, any>) => {
  const response = await api2.post("patientrecords/vital-signs/", {
    vital_bp_systolic: data.bpsystolic?.toString() || "",
    vital_bp_diastolic: data.bpdiastolic?.toString() || "",
    vital_temp: data.temp?.toString() || "",
    vital_RR: "",
    vital_o2: data.o2?.toString() || "",
    vital_pulse: data.pr?.toString() || "",
    created_at: new Date().toISOString(),
  });
  return response.data;
};


export const createFollowUpVisit = async (
  patrec_id: string,
  followv_date: string,
  followv_description: string 
) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", {
      followv_date,
      patrec: parseInt(patrec_id, 10),
      followv_status: "pending",
      followv_description,
      created_at: new Date().toISOString(),
    });
    console.log("Parsed patrec_id:", parseInt(patrec_id, 10)); // Logs parsed value for debugging
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Handle 400 Bad Request specifically
    if (axiosError.response?.status === 400) {
      console.error('Validation Errors:', axiosError.response.data);
      
      // Type guard for Django REST framework validation errors
      if (axiosError.response.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as Record<string, any>;
        
        // Handle field-specific errors
        if (errorData.patrec) {
          console.error('Patient record error:', errorData.patrec);
        }
        if (errorData.followv_date) {
          console.error('Date error:', errorData.followv_date);
        }
      }
      
      // Throw a more specific error
      throw new Error('Validation failed: ' + JSON.stringify(axiosError.response.data));
    }
    
    // Re-throw other errors
    throw error;
  }
};


// New API function for fetching previous vaccination history
export const getVaccinationHistory = async (vachist_id: string) => {
    const response = await api2.get(`vaccination/vaccination-history/${vachist_id}/`);
    return response.data;
  };
  
  // New API function for updating follow-up visit
  export const updateFollowUpVisit = async (followv_id: string, status: string) => {
    await api2.patch(`patientrecords/follow-up-visit/${parseInt(followv_id, 10)}/`, {
      followv_status: status,
    });
  };
  

  
export const deleteVaccinationRecord = async (vacrec_id: string) => {
  await api2.delete(`vaccination/vaccination-record/${vacrec_id}/`);
};

export const deletePatientRecord = async (patrec_id: string) => {
  const parsedPatrecId = parseInt(patrec_id, 10);
  await api2.delete(`patientrecords/patient-record/${parsedPatrecId}/`);
};

export const deleteVitalSigns = async (vital_id: string) => {
  await api2.delete(`patientrecords/vital-signs/${vital_id}/`);
};

export const deleteFollowUpVisit = async (followv_id: string) => {
  await api2.delete(`patientrecords/follow-up-visit/${followv_id}/`);
};

export const deleteVaccinationHistory = async (vachist_id: string) => {
  await api2.delete(`vaccination/vaccination-history/${vachist_id}/`);

};


export const createAntigenStockTransaction = async (
  vacStck_id: number,
  staff_id: string,
  qty: string = "1 dose",
  action: string = "Administered",
) => {
  const transactionPayload = {
    antt_qty: qty,
    antt_action: action,
    staff: staff_id,
    vacStck_id: vacStck_id,
  };

  await api2.post("inventory/antigens_stocks/transaction/", transactionPayload);
};