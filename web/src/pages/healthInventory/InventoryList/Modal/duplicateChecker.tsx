export const isDuplicateVaccineList = (vaccineList: any[], newVaccineName: string) => {
  return vaccineList.some((vac) => vac.vac_name.trim().toLowerCase() === newVaccineName.trim().toLowerCase());
};

export const isDuplicateVaccine = (vaccineList: any[], vaccineName: string, currentVaccineId?: number) => {
  return vaccineList.some(
    (vac) => vac.vac_id !== currentVaccineId && vac.vac_name.trim().toLowerCase() === vaccineName.trim().toLowerCase(),
  );
};

export const isDuplicateMedicine = (medicines: any[], newMedicine: string) => {
    return medicines.some((med) => med?.med_name?.trim()?.toLowerCase() === newMedicine?.trim()?.toLowerCase());
  };
