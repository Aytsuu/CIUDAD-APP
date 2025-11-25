//Medicine

export const formOptions = [
  { id: "Over The Counter", name: "Over the Counter" },
  { id: "Prescription", name: "Prescription" }
];

export interface MedicineData {
  id: string;
  medicineName: string;
  cat_name: string;
  cat_id: string;
  med_type?: string;
}

export const timeUnits = [
  { id: "years", name: "Years" },
  { id: "months", name: "Months" },
  { id: "weeks", name: "Weeks" },
  { id: "days", name: "Days" }
];

export const vaccineTypes = [
  { id: "routine", name: "Routine" },
  { id: "primary", name: "Primary Series" },
  { id: "conditional", name: "Conditional" }
];

export const formMedOptions = [
  { id: "Tablet", name: "Tablet" },
  { id: "Capsule", name: "Capsule" },
  { id: "Syrup", name: "Syrup" },
  { id: "Injection", name: "Injection" },
  { id: "Ointment", name: "Ointment" },
  { id: "Cream", name: "Cream" },
  { id: "Gel", name: "Gel" },
  { id: "Lotion", name: "Lotion" },
  { id: "Solution", name: "Solution" },
  { id: "Suspension", name: "Suspension" },
  { id: "Inhaler", name: "Inhaler" },
  { id: "Nebulizer", name: "Nebulizer" },
  { id: "Spray", name: "Spray" },
  { id: "Drops", name: "Drops" },
  { id: "Suppository", name: "Suppository" },
  { id: "Patch", name: "Patch" },
  { id: "Powder", name: "Powder" },
  { id: "Granules", name: "Granules" },
  { id: "Sachet", name: "Sachet" },
  { id: "Lozenges", name: "Lozenges" },
  { id: "Chewable", name: "Chewable Tablet" },
  { id: "Implants", name: "Implants" }
];

export const dosageUnitOptions = [
    { id: "Mg", name: "mg" },
    { id: "Ml", name: "ml" },
    { id: "Mcg", name: "mcg" },
    { id: "Iu", name: "IU" },
    { id: "G", name: "g" },
    { id: "Percent", name: "%" },
    { id: "Unit", name: "Unit" },
    { id: "Puff", name: "Puff" },
    { id: "Drop", name: "Drop" },
    { id: "Patch", name: "Patch" },
    { id: "Ampule", name: "Ampule" },
    { id: "Vial", name: "Vial" },
    { id: "Sachet", name: "Sachet" },
    { id: "Suppository", name: "Suppository" }
];

export interface DoseDetail {
  id?: number;
  doseNumber: number;
  interval?: number;
  unit?: string;
  vacInt_id?: number;
  routineF_id?: number;
}

export type VaccineRecords = {
  id: number;
  vaccineName: string;
  vaccineType: string;
  ageGroup: string;
  doses: number | string;
  schedule: string;
  agegrp_id: string;
  category: string;
  noOfDoses?: number | string;
  doseDetails: {
    doseNumber: number;
    interval?: number;
    unit?: string;
  }[];
};
