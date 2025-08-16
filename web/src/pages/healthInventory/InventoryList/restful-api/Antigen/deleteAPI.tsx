
import {api2} from "@/api/api";


  export const handleDeleteAntigen = async (
    id: number,
    category: string,
  ) => {
    try {
      const endpoint = category === "Vaccine"
        ? `inventory/vac_list/${id}/`
        : `inventory/imz_supplies/${id}/`;
  
      const res = await api2.delete(endpoint);
      return res.data
    } catch (err) {
      console.error(err);
      throw err; 
    }
  };


  

export const deleteRoutineFrequencies = async (vaccineId: number) => {
  try {
    const routines = await api2.get(`inventory/routine_freq/`, {
      params: { vac_id: vaccineId },
    });
    // Validate that all fetched records belong to the correct vaccineId
    const validRoutines = routines.data.filter(
      (routine: { routineF_id: number; vac_id: number }) =>
        routine.vac_id === vaccineId
    );
    if (validRoutines.length !== routines.data.length) {
      console.warn(
        `Found ${
          routines.data.length - validRoutines.length
        } invalid routine frequencies for vac_id=${vaccineId}`
      );
    }
    await Promise.all(
      validRoutines.map((routine: { routineF_id: number }) =>
        api2.delete(`inventory/routine_freq/${routine.routineF_id}/`)
      )
    );
  } catch (err) {
    console.error("Error deleting routine frequencies:", err);
    throw err;
  }
};

export const deleteVaccineIntervals = async (vaccineId: number) => {
  try {
    const intervals = await api2.get(`inventory/vac_intervals/`, {
      params: { vac_id: vaccineId },
    });
    // Validate that all fetched records belong to the correct vaccineId
    const validIntervals = intervals.data.filter(
      (interval: { vacInt_id: number; vac_id: number }) =>
        interval.vac_id === vaccineId
    );
    if (validIntervals.length !== intervals.data.length) {
      console.warn(
        `Found ${
          intervals.data.length - validIntervals.length
        } invalid intervals for vac_id=${vaccineId}`
      );
    }
    await Promise.all(
      validIntervals.map((interval: { vacInt_id: number }) =>
        api2.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
      )
    );
  } catch (err) {
    console.error("Error deleting vaccine intervals:", err);
    throw err;
  }
};

export const deleteConditionalVacinne = async (vaccineId: number) => {
  try {
    const response = await api2.delete(
      `inventory/conditional_vaccine/${vaccineId}/`
    );
    return response.data;
  } catch (err) {
    console.error("Error deleting conditional vaccine:", err);
    throw err;
  }
};
