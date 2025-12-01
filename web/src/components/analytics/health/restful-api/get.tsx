import { api2 } from "@/api/api";


export const getIllnessChart = async (month: string): Promise<any> => {
    try {
      const url = `/reports/medical-history/monthly/${month}/`;
      const response = await api2.get<any>(url);
      console.log("Medical History Chart Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Medical History Chart:", error);
      throw error;
    }
  };
  

  
  
  export const getVaccinationChart = async (month: string): Promise<any> => {
    try {
      const url = `/reports/vaccination-records/monthly/chart/${month}/`;
      const response = await api2.get<any>(url);
      console.log("Medical History Chart Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Medical History Chart:", error);
      throw error;
    }
  };
  



// vaccination chart new
export const getVaccineResidentChart = async (year: string): Promise<any> => {
    try {
        const url = `/reports/vaccination-resident-counts/${year}/`;
        const response = await api2.get<any>(url);
        console.log("Vaccine Resident Chart Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching Vaccine Resident Chart:", error);
        throw error;
    }
};