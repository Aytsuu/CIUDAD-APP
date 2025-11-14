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
  { id: "Tablet", name: "tablet" },
  { id: "Capsule", name: "capsule" },
];



export const dosageUnitOptions = [
    { id: "Mg", name: "mg" },
    { id: "Ml", name: "ml" },
  ]

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
