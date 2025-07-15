export interface CHSSupplementStat {
    chssupplementstat_id?: number
    chsupp_details?: any
    birthwt?: string | null
    status_type: string
    date_seen: string
    date_given_iron: string
    created_at?: string
    updated_at?: string
    chsupplement?: number
    date_completed?: string | null
  }
  

  export type Medicine = {
    minv_id: string
    medrec_qty: number
    reason: string
    name?: string
    dosage?: number
    dosageUnit?: string
    form?: string
  }
  

import type { FormData } from "@/form-schema/chr-schema/chr-schema";

export const initialFormData: FormData = {
  familyNo: "",
  pat_id: "",
  rp_id: "",
  trans_id: "",
  ufcNo: "",
  childFname: "",
  childLname: "",
  childMname: "",
  childSex: "",
  childDob: "",
  birth_order: 1,
  placeOfDeliveryType: "Home",
  placeOfDeliveryLocation: "",
  childAge: "",
  residenceType: "Resident",
  motherFname: "",
  motherLname: "",
  motherMname: "",
  motherAge: "",
  motherdob: "",
  motherOccupation: "",
  fatherFname: "",
  fatherLname: "",
  fatherMname: "",
  fatherAge: "",
  fatherdob: "",
  fatherOccupation: "",
  address: "",
  landmarks: "",
  dateNewbornScreening: "",
  disabilityTypes: [],
  edemaSeverity: "None",
  BFdates: [],
  vitalSigns: [],
  medicines: [],
  anemic: {
    seen: "",
    given_iron: "",
    is_anemic: false,
    date_completed: "",
  },
  birthwt: {
    seen: "",
    given_iron: "",
    date_completed: "",
  },
  status: "recorded",
  type_of_feeding: "",
  tt_status: "",
  nutritionalStatus: {
    wfa: "",
    lhfa: "",
    wfh: "",
    muac: undefined,
    muac_status: "",
  },
  vaccines: [],
  hasExistingVaccination: false,
  existingVaccines: [],
  created_at: "",
  chhist_status: "",
  historicalSupplementStatuses: [], // ADDED THIS LINE

};

export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord: any;
  originalRecord: any;
  originalDisabilityRecords: { id: number; pd_id: number; status: string }[];
}

export interface AddRecordResult {
  patrec_id: string;
  chrec_id: string;
  chhist_id: string;
  chvital_id?: string;
  followv_id?: string | null;
}
