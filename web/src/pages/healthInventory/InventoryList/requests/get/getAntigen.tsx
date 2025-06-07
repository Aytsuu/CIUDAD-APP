import { api } from "@/pages/api/api";

export const getAntigen = async () => {
    try {
      // Fetch all data in parallel including immunization supplies
      const [vaccines, intervals, frequencies, supplies] = await Promise.all([
        api.get("inventory/vac_list/"),
        api.get("inventory/vac_intervals/"),
        api.get("inventory/routine_freq/"),
        api.get("inventory/imz_supplies/") // Add immunization supplies endpoint
      ]);
  
      if (vaccines.status !== 200 || intervals.status !== 200 || 
          frequencies.status !== 200 || supplies.status !== 200) {
        console.error('Failed to fetch some vaccine data');
        return [];
      }
  
      // Process vaccines
      const vaccineData = vaccines.data.map((vaccine: any) => {
        const vaccineIntervals = intervals.data
          .filter((interval: any) => interval.vac_id === vaccine.vac_id)
          .sort((a: any, b: any) => a.dose_number - b.dose_number);
  
        const routineFrequency = frequencies.data
          .find((freq: any) => freq.vac_id === vaccine.vac_id);
  
        return {
          type: 'vaccine', // Add type identifier
          ...vaccine,
          intervals: vaccineIntervals,
          routineFrequency: routineFrequency || null
        };
      });
  
      // Process immunization supplies
      const supplyData = supplies.data.map((supply: any) => ({
        type: 'supply', // Add type identifier
        imz_id: supply.imz_id,
        imz_name: supply.imz_name,
        vaccat_id: supply.vaccat_id,
        vaccat_details: {
          vaccat_id: supply.vaccat_id,
          vaccat_type: supply.vaccat_details?.vaccat_type || 'Immunization Supply'
        },
        created_at: supply.created_at,
        updated_at: supply.updated_at,
        // Add empty/default fields to match vaccine structure
        vac_type_choices: 'supply',
        age_group: 'N/A',
        specify_age: 'N/A',
        no_of_doses: 0,
        intervals: [],
        routineFrequency: null
      }));
  
      // Combine both datasets
      return [...vaccineData, ...supplyData];
    } catch (err) {
      console.error('Error fetching combined vaccine data:', err);
      return [];
    }
  };



  export const getImzSup = async () => {
    try {
      const res = await api.get("inventory/imz_supplies/");
      if (res.status === 200) {
        return res.data;
      }
      console.error(res.status);
      return []; 
    } catch (err) {
      console.log(err);
      return[]
    }
  };