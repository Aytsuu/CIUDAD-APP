import { api2 } from "@/api/api";
import { AxiosError } from 'axios';




export const createVaccinationRecord = async (
  data:Record<string,any>
 
) => {
  const response = await api2.post("vaccination/vaccination-record/", data);
  return response.data;
};



export const createVaccinationHistory = async (
 
  data:Record<string,any>
  
) => {
  try {
    const response = await api2.post("vaccination/vaccination-history/", data
    
  
  );
    return response.data;
  } catch (error) {
   console.error("Error creating vaccination history:", error);
    throw error; // Re-throw for calling code
  }
};


export const createVitalSigns = async (data: Record<string, any>) => {
  
  try {
    const response = await api2.post("patientrecords/vital-signs/", {
      vital_bp_systolic: data.bpsystolic?.toString() || "",
      vital_bp_diastolic: data.bpdiastolic?.toString() || "",
      vital_temp: data.temp?.toString() || "",
      vital_RR: "",
      vital_o2: data.o2?.toString() || "",
      vital_pulse: data.pr?.toString() || "",
      created_at: new Date().toISOString(),
    });
    console.log("Vital sign created", response.data)

    return response.data;
  } catch (error) {
    console.log(error)
    throw error
    
  }
    
  
};


export const createFollowUpVisit = async (
  patrec_id: string,
  followv_date: string,
  followv_description: string ,
  followv_status: "pending" | "completed" | "missed",
) => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", {
      followv_date,
      patrec: parseInt(patrec_id, 10),
      followv_status:  followv_status || "pending",
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

  try {
    await api2.post("inventory/antigens_stocks/transaction/", transactionPayload);
  } catch (error) {
    console.error("Error occurred while creating antigen stock transaction:", error);
    throw error;
  }
};
