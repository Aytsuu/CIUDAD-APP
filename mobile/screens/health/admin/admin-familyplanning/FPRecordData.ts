export interface FPRecordData {
  client_id?: string;
  givenName?: string;
  lastName?: string;
  middleInitial?: string;
  dateOfBirth: string;
  age?: string;
  occupation?: string;
  address?:{
    houseNumber?: string;
    street?: string;
    barangay?: string;
    province?: string;
    municipality?: string;
  };
  fp_assessment?: any;
  educationalAttainment?: string;
  philhealthNo?: string;
  nhts_status?: boolean;
  typeOfClient?: string;
  reasonForFP?: string;
  methodCurrentlyUsed?: string;
  avg_monthly_income?: number;
  plan_more_children?: boolean;
  fourps?: boolean;
  obstetricalHistory?: {
    menstrualFlow?: string;
    lastDeliveryDate?: string;
    typeOfLastDelivery?: string;
    previousMenstrualPeriod?: string;
    dysmenorrhea?: boolean;
    hydatidiformMole?: boolean;
    ectopicPregnancyHistory?: boolean;
    g_pregnancies?: number;
    p_pregnancies?: number;
    livingChildren?: number;
    fullTerm?: number;
    premature?: number;
    abortion?: number;
    pain?: boolean;
    history?: boolean;
    hiv?: boolean;
  };
  medical_history_records?: { medhist_id: string; illname: string; ill_id: string }[];
  selectedIllnessIds?: string[];
  risk_sti?: {
    abnormalDischarge?: boolean;
    dischargeFrom?: string;
    sores?: boolean;
  };
  risk_vaw?: {
    vaw_unpleasant_rs?: boolean;
    vaw_partner_disapproval?: boolean;
    vaw_domestic_violence?: boolean;
    vaw_referred_to?: string;
  };
  fp_pelvic_exam?: {
    pelvicExamination?: string;
    cervicalTenderness?: boolean;
    cervicalAdnexal?: boolean;
    cervicalConsistency?: string;
    uterinePosition?: string;
    uterineDepth?: string;
  };
  pregnancyCheck?: {
    breastfeeding?: boolean;
    abstained?: boolean;
    recent_baby?: boolean;
    recent_period?: boolean;
    recent_abortion?: boolean;
    using_contraceptive?: boolean;
  };
  skinExamination?: string;
  conjunctivaExamination?: string;
  neckExamination?: string;
  breastExamination?: string;
  abdomenExamination?: string;
  extremitiesExamination?: string;
  weight?: number;
  height?: number;
  bloodPressure?: string;
  pulseRate?: string;
  acknowledgement?: {
    selectedMethod?: string;
    clientName?: string;
    clientSignature?: string;
    clientSignatureDate?: string;
    guardianSignature?: string;
    guardianSignatureDate?: string;
  };
  serviceProvisionRecords?: {
    dateOfVisit?: string;
    methodAccepted?: string;
    nameOfServiceProvider?: string;
    dateOfFollowUp?: string;
    medicalFindings?: string;
    serviceProviderSignature?: string;
  }[];
}