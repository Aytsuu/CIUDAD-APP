
export type PatientInfo = {
  pat_id: string;
  fname: string;
  lname: string;
  mname?: string;
  sex: string;
  dob: string;
  address: string; // Simplified, might be an object in detail
  age: number;
};

export type ServiceProvision = {
  dateOfVisit: string;
  methodAccepted?: string;
  nameOfServiceProvider: string;
  dateOfFollowUp: string;
  methodQuantity?: string | string[]; // Can be string or array of strings
  serviceProviderSignature?: string; // URL to signature image
  medicalFindings?: string;
};

export type PhysicalExam = {
  weight: number;
  bp_systolic: number;
  bp_diastolic: number;
  temperature?: number;
  heent?: boolean;
  chest?: boolean;
  abdomen?: boolean;
  extremities?: boolean;
  skin?: boolean;
  // Additional fields from FP_Physical_Exam model
  skinExamination?: string; // e.g., "normal"
  conjunctivaExamination?: string;
  neckExamination?: string;
  breastExamination?: string;
  abdomenExamination?: string;
  extremitiesExamination?: string;
  fppe_thyroid_enlargement?: boolean;
  fppe_mass?: boolean;
  fppe_nipple_discharge?: boolean;
  fppe_pelvic_exam?: string; // text description
  fppe_cervical_consistency?: string;
  fppe_cervical_tenderness?: string;
  fppe_cervical_adnexal_mass_tenderness?: string;
  fppe_uterine_position?: string;
  fppe_uterine_depth?: number;
};

export type PregnancyCheck = {
  breastfeeding: boolean;
  abstained: boolean;
  recent_baby: boolean;
  recent_period: boolean;
  recent_abortion: boolean;
  using_contraceptive: boolean;
};

export type RiskSTI = {
  multiplePartners: boolean;
  riskySexualBehavior: boolean;
  // Fields from FPRiskStiSerializer
  sti_id?: number;
  abnormalDischarge?: boolean; // maps to sti_ab_discharge
  dischargeFrom?: string; // not directly in serializer, adding for mock
  sores?: boolean; // maps to sti_sores
  pain?: boolean; // not directly in serializer, adding for mock
  history?: boolean; // not directly in serializer, adding for mock
  hiv?: boolean; // not directly in serializer, adding for mock
  sti_ab_discharge?: boolean;
  sti_sores?: boolean;
  sti_gen_warts?: boolean;
  sti_bubues?: boolean;
  sti_risk_factors?: string;
  sti_partner?: boolean;
  sti_recurrent_uti?: boolean;
};

export type ViolenceAgainstWomen = {
  unpleasantRelationship: boolean;
  partnerDisapproval: boolean;
  domesticViolence: boolean;
  referredTo?: string;
  // Fields from FPRiskVawSerializer
  vaw_id?: number;
  vaw_physical?: boolean;
  vaw_sexual?: boolean;
  vaw_emotional?: boolean;
};

export type ObstetricalHistory = {
  g_pregnancies: number; // Gravida
  p_pregnancies: number; // Para
  fullTerm: number;
  premature: number;
  abortion: number;
  livingChildren: number;
  lastDeliveryDate?: string;
  typeOfLastDelivery?: string;
  lastMenstrualPeriod?: string;
  previousMenstrualPeriod?: string;
  menstrualFlow?: string;
  dysmenorrhea?: boolean;
  hydatidiformMole?: boolean;
  ectopicPregnancyHistory?: boolean;
};

export type MedicalHistory = {
  medhistory_id?: number;
  severeHeadaches?: boolean;
  strokeHeartAttackHypertension?: boolean;
  hematomaBruisingBleeding?: boolean;
  breastCancerHistory?: boolean;
  severeChestPain?: boolean;
  cough?: boolean;
  jaundice?: boolean;
  unexplainedVaginalBleeding?: boolean;
  abnormalVaginalDischarge?: boolean;
  phenobarbitalOrRifampicin?: boolean;
  smoker?: boolean;
  disability?: boolean;
  disabilityDetails?: string;
};

export type AddressInfo = {
  add_id?: number;
  houseNumber?: string;
  street?: string;
  barangay?: string;
  municipality?: string;
  province?: string;
};

export type SpouseInfo = {
  spouse_id?: number;
  s_lastName?: string;
  s_givenName?: string;
  s_middleInitial?: string;
  s_dateOfBirth?: string;
  s_age?: number;
  s_occupation?: string;
  spouse_lname?: string; // from backend serializer
  spouse_fname?: string; // from backend serializer
  spouse_mname?: string; // from backend serializer
  spouse_dob?: string; // from backend serializer
  spouse_occupation?: string; // from backend serializer
};

export type BodyMeasurement = {
  bm_id?: number;
  age?: string;
  height?: string | number;
  weight?: string | number;
  created_at?: string;
  patrec?: number;
  staff?: number | null;
  bmi?: number;
  bmi_category?: string;
};

export type PelvicExamDetail = {
  pelvic_id?: number;
  pelvic_exam?: string;
  cervical_consistency?: string;
  cervical_tenderness?: boolean;
  cervical_adnexal_mass_tenderness?: boolean;
  uterine_position?: string;
  uterine_depth?: number;
};

export type Acknowledgement = {
  ack_id?: number;
  selectedMethod?: string;
  clientSignature?: string; // URL to signature image
  clientSignatureDate?: string;
  clientName?: string;
  guardianName?: string;
  guardianSignature?: string; // URL to signature image
  fpa_client_sig?: string; // from backend serializer
  fpa_client_sig_date?: string; // from backend serializer
  fpa_guardian_name?: string; // from backend serializer
  fpa_guardian_sig?: string; // from backend serializer
  fpa_guardian_sig_date?: string; // from backend serializer
};

// Comprehensive Family Planning Record Detail
export type FamilyPlanningRecordDetail = {
  fprecord: ReactNode;
  fprecord_id: number;
  client_id?: string;
  fourps: boolean;
  plan_more_children: boolean;
  avg_monthly_income: string;
  occupation?: string;
  created_at: string;
  updated_at: string;

  // Nested Patient Info (example, adjust based on actual serializer output)
  patient_info?: PatientInfo; // From PatientSerializer
  personal_info_details?: PatientInfo; // From PersonalInfoForFpSerializer (if separate)

  // Service Provision - Assuming this comes from FP_Assessment_Record
  service_provision?: ServiceProvision; // Simplified for initial mock
  serviceProvisionRecords?: ServiceProvision[]; // If multiple service provisions

  // Physical Examination
  physical_exam?: PhysicalExam; // From FP_Physical_Exam model
  body_measurement?: BodyMeasurement; // From BodyMeasurement model, linked via FP_Physical_Exam

  // Pregnancy Check
  pregnancy_check?: PregnancyCheck; // From FP_pregnancy_check model

  // Risk for STI
  risk_sti?: RiskSTI; // From FP_RiskSti model
  sexuallyTransmittedInfections?: RiskSTI; // Frontend representation

  // Violence Against Women (VAW)
  violence_against_women?: ViolenceAgainstWomen; // From FP_RiskVaw model

  // Obstetrical History
  obstetrical_history?: ObstetricalHistory; // From FP_Obstetrical_History model
  fp_obstetrical_history?: ObstetricalHistory; // From FP_Obstetrical_History model (if different key)
  main_obstetrical_history?: ObstetricalHistory; // From main Obstetrical_History model

  // Additional flattened fields for comparison/display from PatientComprehensiveFpSerializer
  typeOfClient?: string;
  subTypeOfClient?: string;
  reasonForFP?: string;
  otherReasonForFP?: string;
  methodCurrentlyUsed?: string;
  otherMethod?: string;
  lastName?: string;
  givenName?: string;
  middleInitial?: string;
  dateOfBirth?: string;
  age?: number;
  educationalAttainment?: string;
  philhealthNo?: string;
  nhts_status?: boolean;
  address?: AddressInfo; // From AddressForFpSerializer
  spouse?: SpouseInfo; // From SpouseForFpSerializer
  weight?: number; // Flattened from BodyMeasurement
  height?: number; // Flattened from BodyMeasurement
  pulseRate?: number; // From VitalSigns
  bloodPressure?: string; // From VitalSigns
  pelvicExamination?: string; // Flattened from FP_Pelvic_Exam
  cervicalConsistency?: string; // Flattened from FP_Pelvic_Exam
  cervicalTenderness?: boolean; // Flattened from FP_Pelvic_Exam
  cervicalAdnexalMassTenderness?: boolean; // Flattened from FP_Pelvic_Exam
  uterinePosition?: string; // Flattened from FP_Pelvic_Exam
  uterineDepth?: number; // Flattened from FP_Pelvic_Exam
  fp_pelvic_exam?: PelvicExamDetail; // From FP_Pelvic_Exam model
  fp_acknowledgement?: Acknowledgement; // From FP_Acknowledgement model
  acknowledgement?: Acknowledgement; // Frontend representation
  medicalHistory?: MedicalHistory; // From MedicalHistory model
};

// Type for the summarized FP records displayed in OverallTable.tsx
export type FPRecordDisplay = {
  fprecord_id: number;
  patient_name: string;
  date_of_visit: string;
  method_used?: string;
  // Add other relevant fields for display in the table
};

