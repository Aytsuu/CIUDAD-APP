// vaccineService.ts
import {api} from "@/pages/api/api";
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
  
      const res = await api.put(`inventory/vac_list/${vaccineId}/`, updatePayload);
      return res.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

// Delete all routine frequencies for a vaccine
export const deleteRoutineFrequencies = async (vaccineId: number) => {
  try {
    const routines = await api.get(`inventory/routine_freq/`, {
      params: { vac_id: vaccineId },
    });
    await Promise.all(
      routines.data.map((routine: { routineF_id: number }) =>
        api.delete(`inventory/routine_freq/${routine.routineF_id}/`)
      )
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Delete all vaccine intervals for a vaccine
export const deleteVaccineIntervals = async (vaccineId: number) => {
  try {
    const intervals = await api.get(`inventory/vac_intervals/`, {
      params: { vac_id: vaccineId },
    });
    await Promise.all(
      intervals.data.map((interval: { vacInt_id: number }) =>
        api.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
      )
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Update or create routine frequency
export const updateRoutineFrequency = async (vaccineId: number, formData: any) => {
  try {
    const routineResponse = await api.get(`inventory/routine_freq/`, {
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
      const res = await api.put(
        `inventory/routine_freq/${routineResponse.data[0].routineF_id}/`,
        routineData
      );
      return res.data;
    } else {
      const res = await api.post("inventory/routine_freq/", routineData);
      return res.data;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Update or create vaccine intervals
export const updateVaccineIntervals = async (vaccineId: number, formData: any) => {
  try {
    const totalDoses = Number(formData.noOfDoses) || 1;
    const intervals = Array.isArray(formData.intervals) ? formData.intervals : [];
    const timeUnits = Array.isArray(formData.timeUnits) ? formData.timeUnits : [];

    const existingIntervals = await api.get(`inventory/vac_intervals/`, {
      params: { vac_id: vaccineId },
    });

    // Handle first dose interval
    if (existingIntervals.data[0]) {
      await api.put(
        `inventory/vac_intervals/${existingIntervals.data[0].vacInt_id}/`,
        {
          interval: formData.ageGroup === "0-5" ? Number(formData.specifyAge) || 0 : 0,
          time_unit: formData.ageGroup === "0-5" ? "months" : "NA",
          dose_number: 1,
          vac_id: vaccineId,
          updated_at: new Date().toISOString(),
        }
      );
    } else {
      await api.post("inventory/vac_intervals/", {
        interval: formData.ageGroup === "0-5" ? Number(formData.specifyAge) || 0 : 0,
        time_unit: formData.ageGroup === "0-5" ? "months" : "NA",
        dose_number: 1,
        vac_id: vaccineId,
        updated_at: new Date().toISOString(),
      });
    }

    // Handle subsequent doses
    for (let i = 1; i < totalDoses; i++) {
      const existingDose = existingIntervals.data.find(
        (d: any) => d.dose_number === i + 1
      );
      if (existingDose) {
        await api.put(
          `inventory/vac_intervals/${existingDose.vacInt_id}/`,
          {
            interval: Number(intervals[i - 1]) || 0,
            time_unit: timeUnits[i - 1] || "months",
            dose_number: i + 1,
            vac_id: vaccineId,
            updated_at: new Date().toISOString(),
          }
        );
      } else {
        await api.post("inventory/vac_intervals/", {
          interval: Number(intervals[i - 1]) || 0,
          time_unit: timeUnits[i - 1] || "months",
          dose_number: i + 1,
          vac_id: vaccineId,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};