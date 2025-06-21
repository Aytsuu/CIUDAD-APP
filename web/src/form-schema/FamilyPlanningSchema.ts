import { z } from "zod";

const ServiceProvisionRecordSchema = z.object({
  dateOfVisit: z.string().nonempty("Date of visit is required"),
  methodAccepted: z.string().optional(),
  nameOfServiceProvider: z.string().nonempty("Service provider name is required"),
  dateOfFollowUp: z.string().nonempty("Follow-up date is required"),
  methodQuantity: z.string().optional(),
  methodUnit: z.string().nonempty("Method unit is required"),
  serviceProviderSignature: z.string().optional(),
  medicalFindings: z.string().optional(),
  weight: z.coerce.number().min(1, "Weight must be at least 1 kg"),
  bp_systolic: z.coerce.number().min(1, "Systolic BP must be at least 1"),
  bp_diastolic: z.coerce.number().min(1, "Diastolic BP must be at least 1"),
});

const PregnancyCheckSchema = z.object({
  breastfeeding: z.boolean().default(false),
  abstained: z.boolean().default(false),
  recent_baby: z.boolean().default(false),
  recent_period: z.boolean().default(false),
  recent_abortion: z.boolean().default(false),
  using_contraceptive: z.boolean().default(false),
});

const FamilyPlanningBaseSchema = z.object({
  pat_id: z.string().optional(),
  fpt_id: z.string().optional(),
  clientID: z.string().optional(),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean({ required_error: "You must choose Yes or No" }),
  pantawid_4ps: z.boolean(),

  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
  dateOfBirth: z.string().nonempty("Birthdate is required"),
  age: z.coerce.number().min(1, "Age is required and must be a positive number"),
  educationalAttainment: z.string().nonempty("Educational Attainment is required"),
  occupation: z.string().optional(),

  address: z.object({
    houseNumber: z.string().optional(),
    street: z.string().optional(),
    barangay: z.string().nonempty("Barangay is required"),
    municipality: z.string().nonempty("Municipality/City is required"),
    province: z.string().nonempty("Province is required"),
  }),

  spouse: z.object({
    s_lastName: z.string().optional(),
    s_givenName: z.string().optional(),
    s_middleInitial: z.string().max(1).optional(),
    s_dateOfBirth: z.string().optional(),
    s_age: z.coerce.number().optional(),
    s_occupation: z.string().optional(),
  }),

  numOfLivingChildren: z.coerce.number().min(0).optional(),
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().nonempty("Average monthly income is required"),

  typeOfClient: z.string().nonempty("Type of client is required"),
  // Make subTypeOfClient, reasonForFP, methodCurrentlyUsed optional by default
  // Their requirement will be handled in superRefine
  subTypeOfClient: z.string().optional(), 
  reasonForFP: z.string().optional(), 
  otherReasonForFP: z.string().optional(),
  reason: z.string().optional(), // For "Current User" reasons
  fpt_other_reason_fp: z.string().optional(), // This seems to be a typo and should be consolidated with otherReasonForFP or reason. Let's assume it maps to otherReason for 'Side Effects' for now.
  
  methodCurrentlyUsed: z.string().optional(),
  otherMethod: z.string().optional(),

  medicalHistory: z.object({
    severeHeadaches: z.boolean(),
    strokeHeartAttackHypertension: z.boolean(),
    hematomaBruisingBleeding: z.boolean(),
    breastCancerHistory: z.boolean(),
    severeChestPain: z.boolean(),
    cough: z.boolean(),
    jaundice: z.boolean(),
    unexplainedVaginalBleeding: z.boolean(),
    abnormalVaginalDischarge: z.boolean(),
    phenobarbitalOrRifampicin: z.boolean(),
    smoker: z.boolean(),
    disability: z.boolean(),
    disabilityDetails: z.string().optional(),
  }),

  obstetricalHistory: z.object({
    g_pregnancies: z.coerce.number().min(0).default(0),
    p_pregnancies: z.coerce.number().min(0).default(0),
    fullTerm: z.coerce.number().min(0),
    premature: z.coerce.number().min(0),
    abortion: z.coerce.number().min(0),
    livingChildren: z.coerce.number().min(0),
    lastDeliveryDate: z.string().optional(),
    typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(),
    lastMenstrualPeriod: z.string().nonempty("Enter date of last menstrual period"),
    previousMenstrualPeriod: z.string().nonempty("Enter date of previous menstrual period"),
    menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]),
    dysmenorrhea: z.boolean().default(false),
    hydatidiformMole: z.boolean().default(false),
    ectopicPregnancyHistory: z.boolean().default(false),
  }),

  sexuallyTransmittedInfections: z.object({
    abnormalDischarge: z.boolean(),
    dischargeFrom: z.string().optional(),
    sores: z.boolean(),
    pain: z.boolean(),
    history: z.boolean(),
    hiv: z.boolean(),
  }),

  violenceAgainstWomen: z.object({
    unpleasantRelationship: z.boolean(),
    partnerDisapproval: z.boolean(),
    domesticViolence: z.boolean(),
    referredTo: z.enum(["DSWD", "WCPU", "NGOs", "Others"]).optional(),
  }),

  weight: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
  bloodPressure: z.string().nonempty("Blood pressure is required (e.g., 120/80)"),
  pulseRate: z.coerce.number().min(1).optional(),

  skinExamination: z.enum(["normal", "pale", "yellowish", "hematoma", "not_applicable"]),
  conjunctivaExamination: z.enum(["normal", "pale", "yellowish", "not_applicable"]),
  neckExamination: z.enum(["normal", "neck_mass", "enlarged_lymph_nodes", "not_applicable"]),
  breastExamination: z.enum(["normal", "mass", "nipple_discharge", "not_applicable"]),
  abdomenExamination: z.enum(["normal", "abdominal_mass", "varicosities", "not_applicable"]),
  extremitiesExamination: z.enum(["normal", "edema", "varicosities", "not_applicable"]),

  pelvicExamination: z.enum([
    "normal",
    "mass",
    "abnormal_discharge",
    "cervical_abnormalities",
    "warts",
    "polyp_or_cyst",
    "inflammation_or_erosion",
    "bloody_discharge",
    "not_applicable",
  ]).optional(),

  cervicalConsistency: z.enum(["firm", "soft", "not_applicable"]).optional(),
  cervicalTenderness: z.boolean().optional(),
  cervicalAdnexalMassTenderness: z.boolean().optional(),
  uterinePosition: z.enum(["mid", "anteflexed", "retroflexed", "not_applicable"]).optional(),
  uterineDepth: z.string().optional(),
  
  acknowledgement: z.object({
    clientSignature: z.string().optional(),
    clientSignatureDate: z.string().nonempty("Client signature date is required"),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(),
    guardianSignatureDate: z.string().optional(),
  }),
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),
  pregnancyCheck: PregnancyCheckSchema.optional(),
});

export const page1Schema = FamilyPlanningBaseSchema.pick({
  pat_id: true,
  clientID: true,
  philhealthNo: true,
  nhts_status: true,
  pantawid_4ps: true,
  lastName: true,
  givenName: true,
  middleInitial: true,
  dateOfBirth: true,
  age: true,
  educationalAttainment: true,
  occupation: true,
  address: true,
  spouse: true,
  numOfLivingChildren: true,
  planToHaveMoreChildren: true,
  averageMonthlyIncome: true,
  typeOfClient: true,
  subTypeOfClient: true,
  reasonForFP: true,
  otherReasonForFP: true,
  reason: true, // For current user reason
  fpt_other_reason_fp: true, // For current user reason specify
  methodCurrentlyUsed: true,
  otherMethod: true,
});


export const page2Schema = FamilyPlanningBaseSchema.pick({
  medicalHistory: true,
  obstetricalHistory: true,
});

export const page3Schema = FamilyPlanningBaseSchema.pick({
  sexuallyTransmittedInfections: true,
  violenceAgainstWomen: true,
});

export const page4Schema = FamilyPlanningBaseSchema.pick({
  weight: true,
  height: true,
  bloodPressure: true,
  pulseRate: true,
  skinExamination: true,
  conjunctivaExamination: true,
  neckExamination: true,
  breastExamination: true,
  abdomenExamination: true,
  extremitiesExamination: true,
  pelvicExamination: true,
  cervicalConsistency: true,
  cervicalTenderness: true,
  cervicalAdnexalMassTenderness: true,
  uterinePosition: true,
  uterineDepth: true,
});

export const page5Schema = FamilyPlanningBaseSchema.pick({
    acknowledgement: true,
});

export const page6Schema = FamilyPlanningBaseSchema.pick({
  serviceProvisionRecords: true,
}).extend({
  pregnancyCheck: PregnancyCheckSchema.optional(),
});

export const FamilyPlanningSchema = FamilyPlanningBaseSchema.superRefine((data, ctx) => {

  if (data.medicalHistory?.disability && !data.medicalHistory.disabilityDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify disability details", path: ["medicalHistory", "disabilityDetails"] });
  }

  // Common validation for IUD
  const isIUD = data.methodCurrentlyUsed?.includes("IUD");
  if (isIUD) {
    if (!data.pelvicExamination || !data.cervicalConsistency || !data.uterinePosition) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pelvic exam details (Pelvic Examination, Cervical Consistency, Uterine Position) are required for IUD method", path: ["pelvicExamination"] });
    }
  }


  // --- Conditional Logic for Type of Client ---

  if (data.typeOfClient === "newacceptor") {
    // For "New Acceptor", reasonForFP and methodCurrentlyUsed are required
    if (!data.reasonForFP) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for family planning is required for new acceptors", path: ["reasonForFP"] });
    }
    if (!data.methodCurrentlyUsed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Method currently used is required for new acceptors", path: ["methodCurrentlyUsed"] });
    }
    if (data.reasonForFP === "fp_others" && !data.otherReasonForFP) { // Corrected from "Others (Specify)" to "fp_others" based on your options
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the reason for FP", path: ["otherReasonForFP"] });
    }

    if (data.subTypeOfClient) { // If subTypeOfClient is present when it shouldn't be
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sub-type of client is not applicable for new acceptors", path: ["subTypeOfClient"] });
    }
    if (data.reason) { // If reason (for Current User) is present
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for current user is not applicable for new acceptors", path: ["reason"] });
    }
    if (data.fpt_other_reason_fp) { // If other reason (for Current User side effects) is present
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specific reason for current user is not applicable for new acceptors", path: ["fpt_other_reason_fp"] });
    }


  } else if (data.typeOfClient === "currentuser") { // Corrected from "Current User" to "currentuser" based on your options
    // For "Current User", subTypeOfClient is always required
    if (!data.subTypeOfClient) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sub-type of client is required for current users", path: ["subTypeOfClient"] });
    }

    // Conditional logic based on subTypeOfClient
    if (data.subTypeOfClient === "changingmethod") { // Corrected from "Changing Method" to "changingmethod"
      if (!data.reason) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason is required for changing method", path: ["reason"] });
      }
      if (!data.methodCurrentlyUsed) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Method currently used is required for changing method", path: ["methodCurrentlyUsed"] });
      }
      if (data.reason === "Side Effects" && !data.fpt_other_reason_fp) { // Assuming fpt_other_reason_fp maps to specifying side effects
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the side effects", path: ["fpt_other_reason_fp"] });
      }
    } else if (data.subTypeOfClient === "changingclinic" || data.subTypeOfClient === "dropoutrestart") {
      // For "Changing Clinic" or "Dropout/Restart", no methods/reasons are needed
      if (data.reasonForFP) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for FP is not applicable for this sub-type", path: ["reasonForFP"] });
      }
      if (data.otherReasonForFP) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Other reason for FP is not applicable for this sub-type", path: ["otherReasonForFP"] });
      }
      if (data.reason) { // Reason for Current User is not needed
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason is not applicable for this sub-type", path: ["reason"] });
      }
      if (data.fpt_other_reason_fp) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specific reason is not applicable for this sub-type", path: ["fpt_other_reason_fp"] });
      }
      if (data.methodCurrentlyUsed) { // Method currently used is not needed
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Method currently used is not applicable for this sub-type", path: ["methodCurrentlyUsed"] });
      }
      if (data.otherMethod) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Other method is not applicable for this sub-type", path: ["otherMethod"] });
      }
    }

  }
});

export type FormData = z.infer<typeof FamilyPlanningSchema>;
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>;
export type PregnancyCheck = z.infer<typeof PregnancyCheckSchema>;

export default FamilyPlanningSchema;
