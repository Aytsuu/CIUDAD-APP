import { VaccineDetails,FollowUpVisit } from "@/pages/healthServices/childservices/viewrecords/types";


export interface VacrecDetails  {
  vacrec_id?: string,
  vacrec_totaldose?: string,
  created_at?: string,
  updated_at?: string,
  patrec_id?: string

}


export interface VaccinationRecord {
  patrec_id?: number;
  vachist_id?: number;
  vachist_doseNo?: string;
  date_administered?: string;
  vachist_status?: string;
  vachist_age?: number;
  assigned_to?: number | null;
  staff_id?: number;
  vital?: number;
  vacrec?: number;
  vacStck?: number;
  vacrec_status?: string;
  vacrec_totaldose?: number;

  patient?:{
    personal_info?: PersonalInfo
  };

  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
    created_at: string;
    vital_pulse: string;
  };

  vaccine_stock?: {
    vaccinelist?: {
      vac_id?: number;
      vaccat_details?: {
        category?: string;
        vaccat_type?: string;
      };
      intervals?: {
        vacInt_id?: number;
        interval?: number;
        dose_number?: number;
        time_unit?: string;
        vac_id?: number;
      }[];
      routine_frequency?: string | null;
      vac_type_choices?: string;
      vac_name?: string;
      no_of_doses?: number;
      age_group?: string;
      specify_age?: string;
      created_at?: string;
      updated_at?: string;
      category?: string;
    };
    inv_id?: number;
    vac_id?: number;
    solvent?: string;
    batch_number?: string;
    volume?: number;
    qty?: number;
    dose_ml?: number;
    vacStck_used?: number;
    vacStck_qty_avail?: number;
    wasted_dose?: number;
    created_at?: string;
    updated_at?: string;
  };


  vac_details?:VaccineDetails
  vaccine_name?: string;
  batch_number?: string;
  updated_at?: string;
  created_at: string;

  vaccine_details?: {
    no_of_doses?: number;
    age_group?: string;
    vac_type?: string;
  };

  follow_up_visit?:FollowUpVisit
  vacrec_details?: VacrecDetails
}





export type BasicInfoVaccinationRecord = {

  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  pat_type: string;
  address: string;
  vaccination_count: number;
  dob: string;
}
export type filter = "all" | "partially_vaccinated" | "completed";

//   export interface VaccinationCountsCardProps {
//     residentCount: number;
//     transientCount: number;
//     totalCount: number;
//   }

export interface VaccinationCounts {
  residentCount: number;
  transientCount: number;
  totalCount: number;
}



export interface PersonalInfo {
  per_id: number
  per_lname: string
  per_fname: string
  per_mname: string | null
  per_suffix: string | null
  per_sex: string
  per_dob: string
  per_status: string
  per_edAttainment: string
  per_religion: string
  per_contact: string
  per_addresses: Array<{
    add_id: number
    add_province: string
    add_city: string
    add_barangay: string
    add_external_sitio: string
    add_street: string
    sitio: string
  }>
}

export interface AgeGroup {
  agegrp_id: number
  agegroup_name: string
  min_age: number
  max_age: number
  time_unit: "years" | "months" | "weeks" | "days" | "NA" // This is the source type
  created_at: string
  updated_at: string
}

export interface VaccineNotReceived {
  vac_id: number
  intervals: any[] // You might want to define a more specific type for intervals
  routine_frequency: any // You might want to define a more specific type for routine_frequency
  age_group: AgeGroup
  vac_type_choices: string
  vac_name: string
  no_of_doses: number
  created_at: string
  updated_at: string
  category: string
  ageGroup: number
}

export interface Resident {
  status: string
  pat_id: number | null
  rp_id: string
  personal_info: PersonalInfo
  vaccine_not_received: VaccineNotReceived
}

export interface UnvaccinatedResident {
  vaccine_name: string
  pat_id: string
  fname: string
  lname: string
  mname: string | null
  sex: string
  dob: string
  age: string
  sitio: string
  address: string
  pat_type: string
  age_group_name: string
  min_age: number
  max_age: number
  time_unit: "years" | "months" | "weeks" | "days" | "NA" // Made consistent with AgeGroup
}

export interface VaccineCounts {
  [vaccineName: string]: number
}

export interface GroupedResidents {
  [vaccineName: string]: {
    [ageGroupName: string]: UnvaccinatedResident[]
  }
}
