import { api } from "@/pages/api/api";

export interface VaccineType {
  vaccineName: string;
  intervals: number[];
  timeUnits: string[];
  noOfDoses: number;
  ageGroup: string;
  specifyAge: string;
  type: string;
  routineFrequency?: {
    interval: number;
    unit: string;
  };
}

interface VaccineResponse {
  vac_id: number;
  [key: string]: any;
}

export const addVaccine = async (data: {
  vac_type_choices: string;
  vac_name: string;
  vaccat_id: number;
  no_of_doses: number;
  age_group: string;
  specify_age: string;
}): Promise<VaccineResponse> => {
  try {
    const res = await api.post("inventory/vac_list/", data);
    if (!res.data?.vac_id) {
      throw new Error("Invalid vaccine response format");
    }
    return res.data;
  } catch (err) {
    console.error("Error adding vaccine:", err);
    throw err;
  }
};

export const addVaccineIntervals = async (data: {
  vac_id: number;
  dose_number: number;
  interval: number;
  time_unit: string;
  
}): Promise<any> => {
  try {
    const res = await api.post("inventory/vac_intervals/", data);
    return res.data;
  } catch (err) {
    console.error("Error adding vaccine intervals:", err);
    throw err;
  }
};

export const addRoutineFrequency = async (data: {
  vac_id: number;
  dose_number: number;
  interval: number;
  time_unit: string;
}): Promise<any> => {
  try {
    const res = await api.post("inventory/routine_freq/", data);
    return res.data;
  } catch (err) {
    console.error("Error adding routine frequency:", err);
    throw err;
  }
};

export const handlePrimaryVaccine = async (data: VaccineType, vaccineId: number): Promise<void> => {
  if (!data.ageGroup) {
    throw new Error("Age group is required for primary vaccine");
  }

  // First dose for primary vaccine
  await addVaccineIntervals({
    vac_id: vaccineId,
    dose_number: 1,
    interval: data.ageGroup === "0-5" ? Number(data.specifyAge || 0) : 0,
    time_unit: data.ageGroup === "0-5" ? "months" : "NA"
  });

  // Additional doses if needed
  if (data.noOfDoses > 1) {
    const intervals = data.intervals || [];
    const timeUnits = data.timeUnits || [];
    
    if (intervals.length !== data.noOfDoses - 1) {
      throw new Error("Number of intervals doesn't match doses");
    }

    await Promise.all(
      intervals.map((interval, index) => 
        addVaccineIntervals({
          vac_id: vaccineId,
          dose_number: index + 2,
          interval: Number(interval),
          time_unit: timeUnits[index] || 'months',
          
        })
        
      )
    );
  }
};

export const handleRoutineVaccine = async (data: VaccineType, vaccineId: number): Promise<void> => {
  if (!data.routineFrequency) {
    throw new Error("Routine frequency is required");
  }

  await addRoutineFrequency({
    vac_id: vaccineId,
    dose_number: 1,
    interval: Number(data.routineFrequency.interval),
    time_unit: data.routineFrequency.unit
  });
};

export const handleSubmissionError = (error: unknown): void => {
  let errorMessage = "Failed to save vaccine. Please try again.";
  
  if (error instanceof Error) {
    errorMessage = error.message;
    console.error('Submission error:', error);
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    const apiError = error as { response?: { data?: any } };
    errorMessage += `\nError: ${JSON.stringify(apiError.response?.data)}`;
  }
  
  alert(errorMessage);
};