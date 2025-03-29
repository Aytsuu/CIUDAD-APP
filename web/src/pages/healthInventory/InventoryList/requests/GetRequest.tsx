import api from "@/pages/api/api";

// Fetches the list of medicines from the API
export const getMedicines = async () => {
  try {
    const res = await api.get("inventory/medicinelist/");
    if (res.status === 200) { 
      return res.data;
    }
    console.error(res.status);
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFirstAid = async () => {
  try {
    const res = await api.get("inventory/firstaidlist/");
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

export const getCommodity = async() =>{
  try{

    const res= await api.get("inventory/commoditylist/");

    if(res.status==200){
      return res.data;
    }
    console.error(res.status)
    return[]
  }catch(err){
    console.log(err)
    return[]
  }
  
}

// GetRequest.ts
export const getCombinedVaccineData = async () => {
  try {
    // Fetch all data in parallel
    const [vaccines, intervals, frequencies] = await Promise.all([
      api.get("inventory/vac_list/"),
      api.get("inventory/vac_intervals/"),
      api.get("inventory/routine_freq/")
    ]);

    if (vaccines.status !== 200 || intervals.status !== 200 || frequencies.status !== 200) {
      console.error('Failed to fetch some vaccine data');
      return [];
    }

    // Combine the data
    return vaccines.data.map((vaccine: any) => {
      const vaccineIntervals = intervals.data
        .filter((interval: any) => interval.vac_id === vaccine.vac_id)
        .sort((a: any, b: any) => a.dose_number - b.dose_number);

      const routineFrequency = frequencies.data
        .find((freq: any) => freq.vac_id === vaccine.vac_id);

      return {
        ...vaccine,
        intervals: vaccineIntervals,
        routineFrequency: routineFrequency || null
      };
    });
  } catch (err) {
    console.error('Error fetching combined vaccine data:', err);
    return [];
  }
};

