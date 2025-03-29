import api from "@/pages/api/api";

export const toTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};
 
// Function to add a new medicine
export const addMedicine = async (medicineName: string) => {
  try {
    const res = await api.post("inventory/medicinelist/", {
      med_name: toTitleCase(medicineName),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const addFirstAid = async (firstAidName: string) => {
  try {
    const res = await api.post("inventory/firstaidlist/", {
      fa_name: toTitleCase(firstAidName),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const addCommodity = async (commodityName: string) => {
  try {
    const res = await api.post("inventory/commoditylist/", {
      com_name: toTitleCase(commodityName),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
};


// api/inventory.ts
export const addVaccine = async (data: any) => {
  try {
    const res = await api.post("inventory/vac_list/", data);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err; // Re-throw the error to handle it in the component
  }
};

export const addVaccineIntervals = async (data: any) => {
  try {
    const res = await api.post("inventory/vac_intervals/", data);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addRoutineFrequency = async (data: any) => {
  try {
    const res = await api.post("inventory/routine_freq/", data);
    return res.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};