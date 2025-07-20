
import type {FormData, VitalSignType, NutritionalStatusType,} from "@/form-schema/chr-schema/chr-schema";
import type { Patient } from "@/components/ui/patientSearch"; // Ensure this import is correct


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
  // hasExistingVaccination: false,
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



export interface ChildHealthRecord {
  chrec_id: number;
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  householdno: string;
  street: string;
  sitio: string;
  barangay: string;
  city: string;
  province: string;
  landmarks: string;
  pat_type: string;
  address: string;
  mother_fname: string;
  mother_lname: string;
  mother_mname: string;
  mother_contact: string;
  mother_occupation: string;
  father_fname: string;
  father_lname: string;
  father_mname: string;
  father_contact: string;
  father_occupation: string;
  family_no: string;
  birth_weight: number;
  birth_height: number;
  type_of_feeding: string;
  delivery_type: string;
  place_of_delivery_type: string;
  pod_location: string;
  pod_location_details?: string;
  health_checkup_count: number;
  birth_order?: string;
  tt_status?: string; // Optional field for TT status
}






export interface LastPageProps {
onPrevious: () => void;
onSubmit: (data: FormData) => void;
updateFormData: (data: Partial<FormData>) => void;
formData: FormData;
historicalVitalSigns?: VitalSignType[];
historicalNutritionalStatus?: NutritionalStatusType[];
historicalSupplementStatuses: CHSSupplementStat[];
onUpdateHistoricalSupplementStatus: (
  updatedStatuses: CHSSupplementStat[]
) => void;
latestHistoricalNoteContent?: string;
latestHistoricalFollowUpDescription?: string;
latestHistoricalFollowUpDate?: string;
historicalMedicines?: Medicine[];
mode: "newchildhealthrecord" | "addnewchildhealthrecord";
isSubmitting: boolean;
newVitalSigns: VitalSignType[];
setNewVitalSigns: React.Dispatch<React.SetStateAction<VitalSignType[]>>;
}





export type Page2Props = {
onPrevious: () => void
onNext: () => void
updateFormData: (data: Partial<FormData>) => void
formData: FormData
historicalBFdates: string[]
patientHistoricalDisabilities: {
  id: number
  pd_id: number
  status: string
  disability_details: {
    disability_id: number
    disability_name: string
    created_at: string
  }
}[] // Type for historical disabilities
mode: "newchildhealthrecord" | "addnewchildhealthrecord" 
}



export type Page1Props = {
  onNext: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
  mode: "newchildhealthrecord" | "addnewchildhealthrecord";
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  selectedPatientId: string; // Add this prop
  setSelectedPatientId: (id: string) => void; // Add this prop
};



