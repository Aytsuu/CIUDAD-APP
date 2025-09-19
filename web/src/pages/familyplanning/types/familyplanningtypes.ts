
export type FamilyPlanningRecordDetail = {
  fprecord_id: number;
  client_id?: string;
  fourps: boolean;
  plan_more_children: boolean;
  avg_monthly_income: string;
  occupation?: string;
  created_at: string;
  updated_at: string;

  // Nested Patient Info (example, adjust based on actual serializer output)
  patient_info?: {
    pat_id: string;
    fname: string;
    lname: string;
    mname?: string;
    sex: string;
    dob: string;
    address: string;
    age: number;
  };

  // Service Provision
  service_provision?: {
    dateOfVisit: string;
    methodAccepted?: string;
    nameOfServiceProvider: string;
    dateOfFollowUp: string;
    methodQuantity?: string;
    serviceProviderSignature?: string;
    medicalFindings?: string;
  };

  // Physical Examination
  physical_exam?: {
    weight: number;
    bp_systolic: number;
    bp_diastolic: number;
    temperature?: number;
    heent?: boolean;
    chest?: boolean;
    abdomen?: boolean;
    extremities?: boolean;
    skin?: boolean;
  };

  // Pregnancy Check
  pregnancy_check?: {
    breastfeeding: boolean;
    abstained: boolean;
    recent_baby: boolean;
    recent_period: boolean;
    recent_abortion: boolean;
    using_contraceptive: boolean;
  };

  // Risk for STI
  risk_sti?: {
    multiplePartners: boolean;
    riskySexualBehavior: boolean;
    // Add other STI risk fields
  };

  // Violence Against Women (VAW)
  violence_against_women?: {
    unpleasantRelationship: boolean;
    partnerDisapproval: boolean;
    domesticViolence: boolean;
    referredTo?: string;
    // Add other VAW fields
  };

  // Obstetrical History
  obstetrical_history?: {
    g_pregnancies: number; // Gravida
    p_pregnancies: number; // Para
    fullTerm: number;
    premature: number;
    abortion: number;
    livingChildren: number;
  };

  // Add other sections as per your `FamilyPlanningCreateUpdateSerializer`
};