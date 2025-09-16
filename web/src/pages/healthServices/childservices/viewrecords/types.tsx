// // patient-record.interfaces.ts

// export interface PersonalInfo {
//     per_id?: number;
//     per_lname: string;
//     per_fname: string;
//     per_mname: string | null;
//     per_suffix: string | null;
//     per_dob: string;
//     per_sex: string;
//     per_status: string;
//     per_edAttainment: string;
//     per_religion: string;
//     per_contact: string;
//   }

//   export interface RPInfo {
//     rp_id: string;
//     per: PersonalInfo;
//     rp_date_registered: string;
//     staff: string;
//   }

//   export interface FamilyHead {
//     role: string;
//     personal_info: PersonalInfo;
//     rp_id?: string;
//     composition_id?: number;
//   }

//   export interface FamilyHeads {
//     mother?: FamilyHead;
//     father?: FamilyHead;
//   }

//   export interface FamilyHeadInfo {
//     fam_id: string | null;
//     family_heads: FamilyHeads;
//     has_mother: boolean;
//     has_father: boolean;
//     total_heads: number;
//   }

//   export interface SpouseInfo {
//     spouse_exists: boolean;
//     allow_spouse_insertion?: boolean;
//     reason?: string;
//     spouse_id?: number;
//     spouse_type?: string;
//     spouse_lname?: string;
//     spouse_fname?: string;
//     spouse_mname?: string;
//     spouse_occupation?: string;
//     spouse_dob?: string;
//     created_at?: string;
//   }

//   export interface Address {
//     add_street: string;
//     add_barangay: string;
//     add_city: string;
//     add_province: string;
//     add_sitio: string;
//     full_address: string;
//   }

//   export interface PatDetails {
//     pat_id: string;
//     personal_info: PersonalInfo;
//     address: Address;
//     rp_id: RPInfo | null;
//     family_compositions: any[];
//     households: any[];
//     family: { fam_id: string; fc_role: string; fc_id: number } | null;
//     family_head_info: FamilyHeadInfo;
//     spouse_info: SpouseInfo;
//     pat_type: string;
//     pat_status: string;
//     created_at: string;
//     updated_at: string;
//     trans_id: string | null;
//   }

//   export interface PatRecDetails {
//     patrec_id: number;
//     pat_details: PatDetails;
//     patrec_type: string;
//     created_at: string;
//     pat_id: string;
//   }

//   export interface StaffDetails {
//     staff_id: string;
//     staff_assign_date: string;
//     staff_type: string;
//     rp: {
//       rp_id: string;
//       per: PersonalInfo;
//       rp_date_registered: string;
//       staff: string;
//     };
//     pos: {
//       pos_id: number;
//       pos_title: string;
//       pos_max: number;
//       pos_group: string;
//       staff: string;
//     };
//     manager: string;
//   }

//   export interface CHRecDetails {
//     chrec_id: number;
//     staff_details: StaffDetails;
//     patrec_details: PatRecDetails;
//     chr_date: string;
//     ufc_no: string;
//     family_no: string;
//     mother_occupation: string;
//     father_occupation: string;
//     updated_at: string;
//     type_of_feeding: string;
//     place_of_delivery_type: string;
//     birth_order: string;
//     pod_location: string;
//     staff: string;
//     patrec: number;
//   }

//   export interface DisabilityDetails {
//     disability_id: number;
//     disability_name: string;
//     created_at: string;
//   }

//   export interface Disability {
//     pd_id: number;
//     disability_details: DisabilityDetails;
//     created_at: string;
//     patrec: number;
//     disability: number;
//   }

//   export interface FollowVDetails {
//     followv_id: number;
//     followv_date: string;
//     followv_status: string;
//     followv_description: string;
//     created_at: string;
//     updated_at: string;
//     patrec: number;
//   }

//   export interface CHNotes {
//     chnotes_id: number;
//     chhist_details: any;
//     followv_details: FollowVDetails | null;
//     chn_notes: string;
//     created_at: string;
//     updated_at: string;
//     chhist: number;
//     history:any;
//     followv: number | null;
//     staff: string;
//   }

//   export interface BMDetails {
//     bm_id: number;
//     age: string;
//     height: string;
//     weight: string;
//     created_at: string;
//     patrec: number;
//     staff: string;
//   }

//   export interface CHVitalSigns {
//     chvital_id: number;
//     find_details: any;
//     bm_details: BMDetails;
//     chhist_details: any;
//     temp: string;
//     vital:string;
//     created_at: string;
//     bm: number;
//     find: any;
//     chhist: number;
//   }

//   export interface MedDetail {
//     med_id: string;
//     catlist: string;
//     med_name: string;
//     med_type: string;
//     created_at: string;
//     updated_at: string;
//     cat: number;
//   }

//   export interface MinvDetail {
//     minv_id: number;
//     inv_detail: any;
//     med_detail: MedDetail;
//     inv_id: string;
//     med_id: string;
//     minv_dsg: number;
//     minv_dsg_unit: string;
//     minv_form: string;
//     minv_qty: number;
//     minv_qty_unit: string;
//     minv_pcs: number;
//     minv_qty_avail: number;
//   }

//   export interface MedRecDetail {
//     medrec_id: number;
//     minv_details: MinvDetail;
//     medrec_qty: number;
//     reason: string | null;
//     requested_at: string;
//     fulfilled_at: string;
//     signature: string | null;
//     patrec_id: number;
//     minv_id: number;
//     medreq_id: number | null;
//     staff: string | null;
//   }

//   export interface CHSupplement {
//     chsupplement_id: number;
//     medrec_details: MedRecDetail;
//     chhist: number;
//     medrec: number;
//   }

//   export interface EBFCheck {
//     ebf_id: number;
//     chhist_details: any;
//     ebf_date: string;
//     chhist: number;
//     created_at: string;
//   }

//   export interface CHSSupplementStat {
//     chssupplementstat_id: number;
//     chsupp_details: any;
//     birthwt: string | null;
//     status_type: string;
//     date_seen: string;
//     date_given_iron: string;
//     created_at: string;
//     updated_at: string;
//     chsupplement: number;
//     date_completed?: string | null;
//   }

//   export interface NutritionStatus {
//     nutstat_id: number;
//     chvital_details: any;
//     wfa: string;
//     lhfa: string;
//     wfl: string;
//     muac: string;
//     muac_status: string;
//     created_at: string;
//     chvital: number;
//   }

// export interface ImmunizationTracking {
//   imt_id: number;
//   vachist_details: VaccinationHistoryDetails;
//   hasExistingVaccination: boolean;
//   created_at: string;
//   vachist: number;
//   chhist: number;

// }

// export interface VaccineDetails {
//   vac_id: number;
//   routine_frequency: null | string;
//   age_group: AgeGroup;
//   vac_type_choices: string;
//   vac_name: string;
//   no_of_doses: number;
//   created_at: string;
//   updated_at: string;
//   category: string;
//   ageGroup: number;
// }
// export interface VaccinationHistoryDetails {
//   vachist_id: number;
//   vital_signs: VitalSigns;
//   vaccine_stock: VaccineStock;
//   follow_up_visit: FollowUpVisit;
//   vacrec_details: VaccinationRecordDetails;
//   vachist_doseNo: number;
//   vachist_age: string;
//   vachist_status: string;
//   created_at: string;
//   assigned_to: null | any; // You might want to replace 'any' with a specific type
//   staff: null | any; // You might want to replace 'any' with a specific type
//   vital: number;
//   vacrec: number;
//   vacStck_id: number;
//   vac_details: VaccineDetails; // You might want to replace 'any' with a specific type
//   followv: number;

// }

// export interface VitalSigns {
//   vital_id: number;
//   vital_bp_systolic: string;
//   vital_bp_diastolic: string;
//   vital_temp: string;
//   vital_RR: string;
//   vital_o2: string;
//   vital_pulse: string;
//   created_at: string;
//   patrec: null | any; // You might want to replace 'any' with a specific type
//   staff: null | any; // You might want to replace 'any' with a specific type
// }

// export interface VaccineStock {
//   vacStck_id: number;
//   vaccinelist: VaccineList;
//   inv_details: InventoryDetails;
//   inv_id: string;
//   vac_id: number;
//   solvent: string;
//   batch_number: string;
//   volume: number;
//   qty: number;
//   dose_ml: number;
//   vacStck_used: number;
//   vacStck_qty_avail: number;
//   wasted_dose: number;
//   updated_at: string;
//   created_at: string;
// }

// export interface VaccineList {
//   vac_id: number;
//   intervals: any[]; // You might want to replace 'any' with a specific type
//   routine_frequency: RoutineFrequency;
//   age_group: AgeGroup;
//   vac_type_choices: string;
//   vac_name: string;
//   no_of_doses: number;
//   created_at: string;
//   updated_at: string;
//   category: string;
//   ageGroup: number;
// }

// export interface RoutineFrequency {
//   routineF_id: number;
//   interval: number;
//   dose_number: number;
//   time_unit: string;
//   vac_id: number;
// }

// export interface AgeGroup {
//   agegrp_id: number;
//   agegroup_name: string;
//   min_age: number;
//   max_age: number;
//   time_unit: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface InventoryDetails {
//   inv_id: string;
//   expiry_date: string;
//   inv_type: string;
//   created_at: string;
//   is_Archived: boolean;
//   updated_at: string;
// }

// export interface FollowUpVisit {
//   followv_id: number;
//   followv_date: string;
//   followv_status: string;
//   followv_description: string;
//   created_at: string;
//   updated_at: string;
//   patrec: number;
// }

// export interface VaccinationRecordDetails {
//   vacrec_id: number;
//   vacrec_totaldose: number;
//   created_at: string;
//   updated_at: string;
//   patrec_id: number;
// }

//   export interface ChildHealthHistoryRecord {
//     chhist_id: string;
//     disabilities: Disability[];
//     created_at: string;
//     tt_status: string;
//     status: string;
//     chrec: number;
//     chrec_details: CHRecDetails;
//     child_health_notes: CHNotes[];
//     child_health_vital_signs: CHVitalSigns[];
//     child_health_supplements: CHSupplement[];
//     exclusive_bf_checks: EBFCheck[];
//     immunization_tracking: ImmunizationTracking[];
//       supplements_statuses: CHSSupplementStat[];
//     nutrition_statuses: NutritionStatus[];
//   }

// export interface FieldConfig {
//     label: string;
//     path: string[];
//     format?: (
//       value: any,
//       record?: ChildHealthHistoryRecord
//     ) => string | JSX.Element[] | string[];
//   }
