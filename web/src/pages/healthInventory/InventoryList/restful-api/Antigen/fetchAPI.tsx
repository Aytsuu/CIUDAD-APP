import {api2} from "@/api/api";



export const getImzSup = async () => {
  try {
    const res = await api2.get("inventory/imz_supplies/");
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

  export const getVaccineList = async () => {
      try {
        const res = await api2.get("inventory/vac_list/");
        if (res.status !== 200) {
          console.error("Failed to fetch vaccine data");
          return [];
        }
        return res.data; // Return the actual data
      } catch (err) {
        console.error("Error fetching vaccine data:", err);
        return [];
      }
    };

    
export const getAntigen = async () => {
  try {
    const [vaccines, intervals, frequencies, supplies] = await Promise.all([
      api2.get("inventory/vac_list/"),
      api2.get("inventory/vac_intervals/"),
      api2.get("inventory/routine_freq/"),
      api2.get("inventory/imz_supplies/"), 
    ]);

    if (
      vaccines.status !== 200 ||
      intervals.status !== 200 ||
      frequencies.status !== 200 ||
      supplies.status !== 200
    ) {
      console.error("Failed to fetch some vaccine data");
      return [];
    }

    // Process vaccines
    const vaccineData = vaccines.data.map((vaccine: any) => {
      const vaccineIntervals = intervals.data
        .filter((interval: any) => interval.vac_id === vaccine.vac_id)
        .sort((a: any, b: any) => a.dose_number - b.dose_number);

      const routineFrequency = frequencies.data.find(
        (freq: any) => freq.vac_id === vaccine.vac_id
      );

      // Extract age group information
      const ageGroup = vaccine.age_group || null;
      const ageGroupId = vaccine.ageGroup || (ageGroup ? ageGroup.agegrp_id : null);

      return {
        ...vaccine,
        ageGroup: ageGroupId,
        age_group: ageGroup, 
        intervals: vaccineIntervals,
        routineFrequency: routineFrequency || null,
      };
    });

    // Process immunization supplies
    const supplyData = supplies.data.map((supply: any) => ({
      type: "supply", // Add type identifier
      imz_id: supply.imz_id,
      imz_name: supply.imz_name,
      category: supply.category,
      created_at: supply.created_at,
      updated_at: supply.updated_at,
      // Add empty/default fields to match vaccine structure
      vac_type_choices: "N/A",
      age_group: null,
      ageGroup: null,
      no_of_doses: 0,
      intervals: [],
      routineFrequency: null,
    }));

    // Combine both datasets
    return [...vaccineData, ...supplyData];
  } catch (err) {
    console.error("Error fetching combined vaccine data:", err);
    return [];
  }
};