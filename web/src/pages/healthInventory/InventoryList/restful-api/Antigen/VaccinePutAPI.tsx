// vaccineService.ts
import {api2} from "@/api/api";
import { toTitleCase } from "@/helpers/ToTitleCase";

// Update main vaccine details
export const updateVaccineDetails = async (vaccineId: number, formData: any) => {
    try {
      const updatePayload = {
        vac_name: toTitleCase(formData.vaccineName),
        vac_type_choices: formData.type,
        no_of_doses: Number(formData.noOfDoses),
        age_group: formData.ageGroup,
        specify_age: formData.ageGroup === "0-5" ? String(formData.specifyAge) : formData.ageGroup,
        vaccat_id: 1,
        updated_at: new Date().toISOString(),
      };
  
      const res = await api2.put(`inventory/vac_list/${vaccineId}/`, updatePayload);
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

// vaccineService.ts

export const deleteRoutineFrequencies = async (vaccineId: number) => {
  try {
    const routines = await api2.get(`inventory/routine_freq/`, {
      params: { vac_id: vaccineId },
    });
    // Validate that all fetched records belong to the correct vaccineId
    const validRoutines = routines.data.filter(
      (routine: { routineF_id: number; vac_id: number }) => routine.vac_id === vaccineId
    );
    if (validRoutines.length !== routines.data.length) {
      console.warn(`Found ${routines.data.length - validRoutines.length} invalid routine frequencies for vac_id=${vaccineId}`);
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
      (interval: { vacInt_id: number; vac_id: number }) => interval.vac_id === vaccineId
    );
    if (validIntervals.length !== intervals.data.length) {
      console.warn(`Found ${intervals.data.length - validIntervals.length} invalid intervals for vac_id=${vaccineId}`);
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


// Update or create routine frequency
export const updateRoutineFrequency = async (vaccineId: number, formData: any) => {
  try {
    const routineResponse = await api2.get(`inventory/routine_freq/`, {
      params: { vac_id: vaccineId },
    });

    const routineData = {
      interval: Number(formData.routineFrequency?.interval) || 1,
      dose_number: 1,
      time_unit: formData.routineFrequency?.unit || "years",
      vac_id: vaccineId,
      updated_at: new Date().toISOString(),
    };

    if (routineResponse.data.length > 0) {
      const res = await api2.put(
        `inventory/routine_freq/${routineResponse.data[0].routineF_id}/`,
        routineData
      );
      return res.data;
    } else {
      const res = await api2.post("inventory/routine_freq/", routineData);
      return res.data;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};




export const updateVaccineIntervals = async (vaccineId: number, formData: any) => {
  try {
    console.log("Updating vaccine intervals for:", vaccineId, formData);

    const totalDoses = Number(formData.noOfDoses) || 1;
    const intervals = Array.isArray(formData.intervals) ? formData.intervals : [];
    const timeUnits = Array.isArray(formData.timeUnits) ? formData.timeUnits : [];

    // Get existing intervals
    const existingIntervals = await api2.get(`inventory/vac_intervals/`, {
      params: { vac_id: vaccineId },
    });
    console.log(`Fetched intervals for vac_id=${vaccineId}:`, existingIntervals.data);

    // Validate intervals belong to the correct vaccine
    const validIntervals = existingIntervals.data.filter(
      (interval: { vacInt_id: number; vac_id: number }) => interval.vac_id === vaccineId
    );
    if (validIntervals.length !== existingIntervals.data.length) {
      console.warn(`Found ${existingIntervals.data.length - validIntervals.length} invalid intervals for vac_id=${vaccineId}`);
    }

    // Delete all existing intervals
    await Promise.all(
      validIntervals.map((interval: { vacInt_id: number }) =>
        api2.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
      )
    );

    // Create new intervals
    const intervalPromises = [];

    // Handle first dose interval
    intervalPromises.push(
      api2.post("inventory/vac_intervals/", {
        interval: formData.ageGroup === "0-5" ? Number(formData.specifyAge) || 0 : 0,
        time_unit: formData.ageGroup === "0-5" ? "months" : "NA",
        dose_number: 1,
        vac_id: vaccineId,
        updated_at: new Date().toISOString(),
      })
    );

    // Handle subsequent doses
    for (let i = 1; i < totalDoses; i++) {
      intervalPromises.push(
        api2.post("inventory/vac_intervals/", {
          interval: Number(intervals[i - 1]) || 0,
          time_unit: timeUnits[i - 1] || "months",
          dose_number: i + 1,
          vac_id: vaccineId,
          updated_at: new Date().toISOString(),
        })
      );
    }

    await Promise.all(intervalPromises);
    console.log(`Successfully updated intervals for vac_id=${vaccineId}`);
  } catch (err) {
    console.error("Error updating vaccine intervals:", err);
    throw err;
  }
};