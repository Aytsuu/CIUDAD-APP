import api from "@/pages/api/api";


const toTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const updateMedicine = async (med_id: number, medicineName: string) => {
  
    try {
      const res = await api.put(`inventory/update_medicinelist/${med_id}/`, {
        med_name: toTitleCase(medicineName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; // Re-throw the error to handle it in the calling function
    }
  };


  export const updateFirstAid = async (fa_id: number, firstAidName: string) => {
  
    try {
      const res = await api.put(`inventory/update_firstaidlist/${fa_id}/`, {
        fa_name: toTitleCase(firstAidName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };

  export const updateCommodity = async (com_id: number, comName: string) => {
  
    try {
      const res = await api.put(`inventory/update_commoditylist/${com_id}/`, {
        com_name: toTitleCase(comName),
        updated_at: new Date().toISOString(),
      });
  
      return res.data;
    } catch (err) {
      console.log(err);
      throw err; 
    }
  };


  // API Service functions (in separate file like vaccineApiService.ts)
export const updateVaccine = async (vaccineId: number, data: {
  vac_type_choices: string;
  vac_name: string;
  no_of_doses: number;
  age_group: string;
  specify_age: string;
}) => {
  try {
    const response = await api.put(`/vaccines/${vaccineId}/`, {
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
    await api.delete(`/vaccines/${vaccineId}/intervals/`);
    
    // Then create new ones
    const responses = await Promise.all(
      intervals.map(interval => 
        api.post(`/vaccines/${vaccineId}/intervals/`, interval)
      )
    );
    return responses.map(r => r.data);
  } catch (error) {
    console.error('Error updating intervals:', error);
    throw error;
  }
};

export const updateRoutineFrequency = async (vaccineId: number, data: {
  interval: number;
  time_unit: string;
}) => {
  try {
    const response = await api.put(`/vaccines/${vaccineId}/frequency/`, {
      dose_number: 1,
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating routine frequency:', error);
    throw error;
  }
};