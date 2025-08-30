import { api2 } from "@/api/api";

export const addImzSupplies = async (data: Record<string, string>) => {
  try {
    const res = await api2.post("inventory/imz_supplieslist-createview/", data);
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const addVaccine = async (data: { vac_type_choices: string; vac_name: string; no_of_doses: number; ageGroup: number }): Promise<any> => {
  try {
    const res = await api2.post("inventory/vac_list/", data);
    return res.data;
  } catch (err) {
    console.error("Error adding vaccine:", err);
    throw err;
  }
};

export const addVaccineIntervals = async (data: { vac_id: number; dose_number: number; interval: number; time_unit: string }): Promise<any> => {
  try {
    const res = await api2.post("inventory/vac_intervals/", data);
    return res.data;
  } catch (err) {
    console.error("Error adding vaccine intervals:", err);
    throw err;
  }
};

export const addRoutineFrequency = async (data: { vac_id: number; dose_number: number; interval: number; time_unit: string }): Promise<any> => {
  try {
    const res = await api2.post("inventory/routine_freq/", data);
    return res.data;
  } catch (err) {
    console.error("Error adding routine frequency:", err);
    throw err;
  }
};

export const handlePrimaryVaccine = async (data: Record<string, any>, vaccineId: number): Promise<void> => {
  if (!data.ageGroup) {
    throw new Error("Age group is required for primary vaccine");
  }

  // First dose for primary vaccine
  await addVaccineIntervals({
    vac_id: vaccineId,
    dose_number: 1,
    interval: 0,
    time_unit: "NA"
  });

  // Additional doses if needed
  if (data.noOfDoses > 1) {
    const intervals = data.intervals || [];
    const timeUnits = data.timeUnits || [];

    if (intervals.length !== data.noOfDoses - 1) {
      throw new Error("Number of intervals doesn't match doses");
    }
    await Promise.all(
      intervals.map((interval: any, index: any) =>
        addVaccineIntervals({
          vac_id: vaccineId,
          dose_number: index + 2,
          interval: Number(interval),
          time_unit: timeUnits[index] || "months"
        })
      )
    );
  }
};

export const handleRoutineVaccine = async (data: Record<string, any>, vaccineId: number): Promise<void> => {
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

export const addconvaccine = async (vac_id: number) => {
  try {
    const res = await api2.post("inventory/conditional_vaccine/", {
      vac_id: vac_id
    });
    return res.data;
  } catch (error) {
    console.error("Error adding vaccine:", error);
  }
};

export const handleSubmissionError = (error: unknown): void => {
  let errorMessage = "Failed to save vaccine. Please try again.";
  if (error instanceof Error) {
    errorMessage = error.message;
    console.error("Submission error:", error);
  } else if (typeof error === "object" && error !== null && "response" in error) {
    const apiError = error as { response?: { data?: any } };
    errorMessage += `\nError: ${JSON.stringify(apiError.response?.data)}`;
  }
  console.error(errorMessage);
  throw new Error(errorMessage);
};
