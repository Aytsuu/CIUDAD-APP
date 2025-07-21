
  // API Service functions (in separate file like vaccineApiService.ts)
  import { api2 } from "@/api/api";
  import { toTitleCase } from "../case";


  export const updateVaccine = async (vaccineId: number, data: {
    vac_type_choices: string;
    vac_name: string;
    no_of_doses: number;
    age_group: string;
    specify_age: string;
  }) => {
    try {
      const response = await api2.put(`inventory/vaccines/${vaccineId}/`, {
        ...data,
        updated_at: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating vaccine:', error);
      throw error;
    }
  };
  
  export const updateVaccineIntervals = async (vaccineId: number, intervals: Array<{
    dose_number: number;
    interval: number;
    time_unit: string;
  }>) => {
    try {
      // First delete existing intervals
      await api2.delete(`inventory/vaccines/${vaccineId}/`);
      
      // Then create new ones
      const responses = await Promise.all(
        intervals.map(interval => 
          api2.post(`/vaccines/${vaccineId}/intervals/`, interval)
        )
      );
      return responses.map(r => r.data);
    } catch (error) {
      console.error('Error updating intervals:', error);
      throw error;
    }
  };
  
  export const updateVaccineRoutineFrequency = async (vaccineId: number, data: {
    interval: number;
    time_unit: string;
  }) => {
    try {
      const response = await api2.put(`inventory/vaccines/${vaccineId}/`, {
        dose_number: 1,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error('Error updating vaccine routine frequency:', error);
      throw error;
    }
  };
  
  
  
  export const updateImmunizationSupply = async (imz_id: number, data: {
    supply_name: string;
    quantity: number;
    expiry_date?: string;
  }) => {
    try {
      const res = await api2.put(`inventory/imz_supplies/${imz_id}/`, {
        ...data,
        supply_name: toTitleCase(data.supply_name),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  
  
  export const updateVaccineDetails = async (vac_id: number, data: {
    vac_name: string;
    description?: string;
    category_id?: number;
  }) => {
    try {
      const res = await api2.put(`inventory/vac_list/${vac_id}/`, {
        ...data,
        vac_name: toTitleCase(data.vac_name),
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  
  export const updateVaccineInterval = async (vacInt_id: number, data: {
    dose_number: number;
    interval: number;
    time_unit: string;
  }) => {
    try {
      const res = await api2.put(`inventory/vac_intervals/${vacInt_id}/`, {
        ...data,
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
  
  export const updateRoutineFrequency = async (routineF_id: number, data: {
    frequency: number;
    time_unit: string;
  }) => {
    try {
      const res = await api2.put(`inventory/routine_freq/${routineF_id}/`, {
        ...data,
        updated_at: new Date().toISOString(),
      });
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };