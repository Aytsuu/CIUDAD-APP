export type MedicalConsultationHistory = {
    patrec?: number;
    medrec_id?: number;
    medrec_status?: string;
    medrec_chief_complaint?: string;
    medrec_age?: string;
    created_at?: string;
    patrec_details?: {
        pat_id: string;
    } | null;
    vital_signs: {
      vital_bp_systolic?: string;
      vital_bp_diastolic?: string;
      vital_temp?: string;
      vital_RR?: string;
      vital_o2?: string;
      vital_pulse?: string;
    };
    bmi_details: {
      age?: string;
      height?: string;
      weight?: string;
      bmi?: string;
    };
    find_details: {
      subj_summary?: string;
      obj_summary?: string;
      assessment_summary?: string;
      plantreatment_summary?: string;
    } | null;
    staff_details: {
      rp?: {
        per?: {
          per_fname?: string;
          per_lname?: string;
          per_mname?: string;
          per_suffix?: string;
          per_dob?: string;
        };
      } | null;
    } | null;
  };



  export interface MedicalRecord {
    rp_id:string
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
    medicalrec_count: number;
    dob: string;
  }