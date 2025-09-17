import { api2 } from "@/api/api"
import axios from "axios"

export interface IndividualFPRecordDetail {
  patient_id: any

  fprecord: any
  patrec_id: string
  fprecord_id: number
  client_id: string
  patient_name: string
  patient_age: number
  sex: string
  client_type: string
  subtype: string
  method_used: string
  created_at: string
  dateOfFollowUp?: string
  followv_status?: string // Add this field to match backend
  otherMethod?: any
}

export interface FPPatientsCount {
  total_fp_patients: number;
  resident_fp_patients: number;
  transient_fp_patients: number;
  minor_fp_patients: number;
}

export const getFPPatientsCounts = async (): Promise<FPPatientsCount> => {
  try {
    const response = await api2.get("/familyplanning/patient-counts/");
    return response.data;
  } catch (error) {
    console.error("Error fetching FP patient counts:", error);
    throw error;
  }
};

export const getAllFPRecordsForPatient = async (patrec_id: any) => {
  try{
    const res = await api2.get(`/familyplanning/get_all_fp_records_for_patient/${patrec_id}`);
          return res.data;
      } catch (error) {
    console.error("Error fetching FP patient counts:", error);
    throw error;
  }

  };  

// Updated getFPRecordsList to match the new backend structure for the overall table
export const getFPRecordsList = async () => {
  try {
    const response = await api2.get("familyplanning/overall-records/")
    const fpRecords = response.data
    const transformedData = fpRecords.map((record: any) => {
      return {
        fprecord_id: record.fprecord,
        patient_id: record.patient_id, // Ensure patient_id is mapped
        client_id: record.client_id || "N/A",
        patient_name: record.patient_name || "N/A",
        patient_age: record.patient_age || "N/A",
        patient_type: record.patient_type || "N/A",
        client_type: record.client_type || "N/A",
        method_used: record.method_used || "N/A",
        subtype: record.subTypeOfClient || "N/A",
        created_at: record.created_at || "N/A",
        sex: record.sex || "Unknown",
        record_count: record.record_count || 0, // Ensure record_count is mapped
      }
    })

    return transformedData
  } catch (err) {
    console.error("Error fetching FP records for overall table:", err)
    return []
  }
}

export interface FullFPRecordDetail {
  fprecord_id: number;
  client_id: string;
  philhealth_no: string;
  nhts_status: "Yes" | "No";
  pantawid_pamilya_pilipino: "Yes" | "No";
  client_name: {
    last_name: string;
    given_name: string;
    middle_initial: string;
  };
  date_of_birth: string;
  age: number;
  educ_attainment: string;
  occupation: string;
  address: {
    house_no: string;
    street: string;
    barangay: string;
    municipality_city: string;
    province: string;
  };
  contact_number: string;
  civil_status: string;
  religion: string;
  spouse_name: {
    last_name: string;
    given_name: string;
    middle_initial: string;
  };
  spouse_date_of_birth: string;
  spouse_age: number;
  spouse_occupation: string;
  no_of_living_children: number;
  plan_to_have_more_children: "Yes" | "No";
  average_monthly_income: number;
  client_type: "New Acceptor" | "Current User";
  current_user_type?: "Changing Method" | "Changing Clinic" | "Dropout/Restart";
  reason_for_fp: "spacing" | "limiting" | "others";
  reason_for_fp_specify?: string;
  reason_for_change?: "medical condition" | "side-effects" | "others";
  reason_for_change_specify?: string;
  method_currently_used?: string; // For "Changing Method"
  medical_history: {
    severe_headaches_migraine: "yes" | "no";
    history_stroke_heart_attack_hypertension: "yes" | "no";
    non_traumatic_hematoma_frequent_bruising_gum_bleeding: "yes" | "no";
    current_history_breast_cancer_breast_mass: "yes" | "no";
    severe_chest_pain: "yes" | "no";
    cough_more_than_14_days: "yes" | "no";
    jaundice: "yes" | "no";
    unexplained_vaginal_bleeding: "yes" | "no";
    abnormal_vaginal_discharge: "yes" | "no";
    intake_phenobarbital_rifampicin: "yes" | "no";
    is_smoker: "yes" | "no";
    with_disability: "yes" | "no";
  };
  vaw_risk_assessment: {
    unpleasant_relationship_partner: "yes" | "no";
    partner_not_approved_visit_fp_clinic: "yes" | "no";
    history_domestic_violence_vaw: "yes" | "no";
  };
  referral_options: {
    dswd: boolean;
    wcpc: boolean;
    ngos: boolean;
    others: boolean;
    others_specify?: string;
  };
  obstetrical: {
    g: number;
    p: number;
    full_term: number;
    premature: number;
    abortion: number;
    living_children: number;
  };
  visits: Array<{
    // date_of_visit: string;
    // vital_signs: string; 
    medical_findings: string;
    method_accepted: string;
  }>;
  pregnancy_assessment: {
    baby_less_than_6_months_breastfeeding_no_menstrual: "yes" | "no";
    abstained_sexual_intercourse_since_last_menses_delivery: "yes" | "no";
    baby_in_last_4_weeks: "yes" | "no";
    last_menstrual_period_start_within_7_days: "yes" | "no";
    miscarriage_abortion_in_last_7_days: "yes" | "no";
    reliable_contraceptive_method_consistently_correctly: "yes" | "no";
  };
}

export interface Illness {
  ill_id: number
  illname: string
  ill_description: string
  ill_code: string
}

export interface MedicalHistoryRecord {
  medhist_id: number
  ill_id: number
  illname: string
  ill_code: string
  created_at: string
}

// Fetch all available illnesses
export const fetchIllnesses = async (): Promise<Illness[]> => {
  try {
    const response = await api2.get("/familyplanning/illnesses/")
    return response.data
  } catch (error) {
    console.error("Error fetching illnesses:", error)
    throw error
  }
}

// Create medical history records for selected illnesses
export const createMedicalHistoryRecords = async (
  patrec_id: number,
  selected_illness_ids: number[],
): Promise<{ message: string; records: MedicalHistoryRecord[] }> => {
  try {
    const response = await api2.post("/familyplanning/medical-history/create/", {
      patrec_id,
      selected_illness_ids,
    })
    return response.data
  } catch (error) {
    console.error("Error creating medical history records:", error)
    throw error
  }
}

// Fetch existing medical history for a patient
export const fetchPatientMedicalHistory = async (patrec_id: number): Promise<MedicalHistoryRecord[]> => {
  try {
    const response = await api2.get(`/familyplanning/medical-history/${patrec_id}/`)
    return response.data
  } catch (error) {
    console.error("Error fetching patient medical history:", error)
    throw error
  }
}

export async function getFPRecordById(
  fprecord_id: string
): Promise<FullFPRecordDetail> {
    const response = await api2.get(`familyplanning/complete-fp-record/${fprecord_id}`);
   if (response.status !== 200) { // Example check for HTTP 200 OK
    throw new Error(`Failed to fetch family planning record with ID ${fprecord_id}. Status: ${response.status}`);
  }

  return response.data;
}

export const getPatients = async () => {
  try {
    const response = await api2.get("patientrecords/patient")
    return response.data
  } catch (err) {
    console.error("Error fetching patients:", err)
    return []
  }
}

export const getFPRecordsForPatient = async (patientId: string | number): Promise<IndividualFPRecordDetail[]> => {
  try {
    const response = await api2.get(`familyplanning/fp-records-by-patient/${patientId}/`)
    return response.data
  } catch (err) {
    console.error(`❌ Error fetching all FP records for patient ${patientId}:`, err)
    return []
  }
}

// NEW: Function to get the LATEST complete FP record for a patient (for pre-filling form)
export const getLatestCompleteFPRecordForPatient = async (patientId: string): Promise<any | null> => {
  try {
    const response = await api2.get(`familyplanning/latest-fp-record-by-patient/${patientId}/`)
    return response.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      console.log(`No latest complete FP record found for patient ${patientId}. This is expected for new records.`);
      return null; // Return null if no existing record, so the form can load defaults
    }
    console.error(`❌ Error fetching latest complete FP record for patient ${patientId}:`, err)
    throw err // Re-throw other errors
  }
}

// Updated getFPCompleteRecord to handle the new structure (used for viewing a specific record)
export const getFPCompleteRecord = async (fprecord_id: number): Promise<any> => {
  try {
    const response = await api2.get(`familyplanning/complete-fp-record/${fprecord_id}/`)
    return response.data
  } catch (err) {
    console.error(`❌ Error fetching complete FP record ${fprecord_id}:`, err)
    throw err
  }
}