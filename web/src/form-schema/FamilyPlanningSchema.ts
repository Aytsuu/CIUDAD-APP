import { formatDate } from "@/helpers/dateHelper";
import { z } from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

const getPhilippineToday = (): Date => {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  phTime.setHours(0, 0, 0, 0);
  return phTime;
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

export const ServiceProvisionRecordSchema = z.object({
  dateOfVisit: z.string().min(1, "Date of visit is required"),
  methodAccepted: z.string().optional(),
  nameOfServiceProvider: z.string().nonempty("Provider name is required"),
  dateOfFollowUp: z.preprocess(
    (arg) => (arg === "" ? null : arg),
    z.union([
      z.literal(null),
      z.coerce
        .date()
        .refine((date) => date > today, { message: "Follow-up date must be a future date" })
        .refine((date) => !isWeekend(date), { message: "Follow-up date cannot be on weekends (Saturday or Sunday)" })
        .transform((date) => formatDate(date)),
    ]),
  ),
  bloodPressure: z.string().optional(),
  methodQuantity: z.string().optional(),
  serviceProviderSignature: z.string().nonempty("Please sign and save the signature first"),
  medicalFindings: z.string().nonempty("Medical findings are required"),
  weight: z.coerce.number().min(1, "Weight is required").max(300, "Weight must be realistic (1-300kg)"),
  bp_systolic: z.coerce.number().min(60, "Systolic BP must be 60-250").max(250, "Systolic BP must be 60-250"),
  bp_diastolic: z.coerce.number().min(40, "Diastolic BP must be 40-150").max(150, "Diastolic BP must be 40-150"),
})

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
  patrec_id: z.string().optional(),
  // fpt_id: z.string().optional(),
  client_id: z.string().optional(),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean().optional(),
  fourps: z.boolean().optional(),

  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
  dateOfBirth: z.string().nonempty("Birthdate is required"),
  age: z.coerce.number().min(1),
  educationalAttainment: z.string().optional(),
  occupation: z.string().optional(),
  gender: z.string().optional(),
  contact: z.string().optional(),
  address: z.object({
    houseNumber: z.string().optional(),
    street: z.string().optional(),
    barangay: z.string().optional(),
    municipality: z.string().optional(),
    province: z.string().optional(),
  }),

  spouse: z.object({
    s_lastName: z.string().optional(),
    s_givenName: z.string().optional(),
    s_middleInitial: z.string().max(1).optional(),
    s_dateOfBirth: z.string().optional(),
    s_age: z.coerce.number().optional(),
    s_occupation: z.string().optional(),
  }).optional(),

  numOfLivingChildren: z.coerce.number().min(0).optional(),
  plan_more_children: z.boolean(),
  avg_monthly_income: z.string().nonempty("Average monthly income is required"),

  typeOfClient: z.string().nonempty("Type of client is required"),
  subTypeOfClient: z.string().optional(), 
  
  // for new acceptor
  reasonForFP: z.string().optional(), 
  otherReasonForFP: z.string().optional(),
  // For "Current User" reasons
  reason: z.string().optional(), 
  otherReason: z.string().optional(),
  otherMethod: z.string().optional(),
  
  previousMethod: z.string().optional(),

  methodCurrentlyUsed: z.string().nonempty(),
  methodCurrentlyUsedName: z.string().optional(),

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
  }
),
//  medical_history_records: Array<{
//     medhist_id: number;
//     ill_id: number;
//     illname: string;
//     ill_code: string;
//     created_at: string;
//   }>,
//   historical_medical_history: Array<{
//     medhist_id: number;
//     ill_id: number;
//     illname: string;
//     ill_code: string;
//     created_at: string;
//     is_current: boolean;
//   }>,

  obstetricalHistory: z.object({
    g_pregnancies: z.coerce.number().min(0).default(0),
    p_pregnancies: z.coerce.number().min(0).default(0),
    fullTerm: z.coerce.number().min(0),
    premature: z.coerce.number().min(0),
    abortion: z.coerce.number().min(0),
    numOfLivingChildren: z.coerce.number().min(0),
    lastDeliveryDate: z.preprocess(
    (arg) => (arg === '' ? null : arg), // Preprocess empty string to null
    z.union([
      z.literal(null), // Allows the value to be explicitly null
      z.coerce.date().refine(
        (date) => date <= today,
        { message: "Cannot select a future date." }
      ),
    ])
  ).optional(),

    typeOfLastDelivery: z.string().optional(),

    lastMenstrualPeriod: z.preprocess(
    (arg) => (arg === '' ? null : arg),
    z.union([
      z.literal(null),
      z.coerce.date().refine(
        (date) => date <= today,
        { message: "Cannot select a future date." }
      ),
    ])
  ).optional(),

    previousMenstrualPeriod: z.preprocess(
    (arg) => (arg === '' ? null : arg),
    z.union([
      z.literal(null),
      z.coerce.date().refine(
        (date) => date <= today,
        { message: "Cannot select a future date." }
      ),
    ])
  ).optional(),
    menstrualFlow: z.string().optional(),
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
    referredTo: z.string().optional(),
    otherReferral: z.string().optional()
  }),
    weight: z.coerce
    .number({
      invalid_type_error: "Weight must be a number",
    })
    .min(1, {
      message: "Weight cannot be less than 1kg.",
    })
    .max(300, {
      message: "Weight is unrealistically high.",
    }),
  height: z.coerce
    .number({
      invalid_type_error: "Height must be a number",
    })
    .min(30, {
      message: "Height cannot be less than 30cm.",
    })
    .max(250, {
      message: "Height is unrealistically high.",
    }),

  bloodPressure: z.string().nonempty("Blood pressure is required (e.g., 120/80)"),
  pulseRate: z.coerce
    .number({invalid_type_error: "Pulse rate must be a number",})
    .min(80, {
      message: "Pulse rate is too low. Please verify."
    })
    .max(150, {
      message: "Pulse rate is too high. Please verify."
    })
    .refine((val) => val >= 60 && val <= 140, {
      message: "A normal resting pulse rate is between 60-100 beats per minute. This reading is outside that range. Please verify."
    }),
  bodyMeasurementRecordedAt: z.string().optional(),

  skinExamination: z.string().optional(),
  conjunctivaExamination: z.string().optional(),
  neckExamination: z.string().optional(),
  breastExamination: z.string().optional(),
  abdomenExamination: z.string().optional(),
  extremitiesExamination: z.string().optional(),

selectedIllnessIds:z.string().optional(),

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

  cervicalConsistency: z.enum([
    "firm",
    "soft",
    "not_applicable",
  ]).optional(),

  cervicalTenderness: z.boolean().optional(),

  cervicalAdnexal: z.boolean().optional(),

  uterinePosition: z.string().optional(),

  uterineDepth: z.string().optional(),
  
 acknowledgement: z.object({
  selectedMethod: z.string().nonempty("Please select a family planning method"),
  clientSignature: z.string().nonempty("Please sign and save the signature first"),
  clientSignatureDate: z.string()
  .nonempty("Client signature date is required")
  .refine((dateString) => {
    const inputDate = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate.getTime() === today.getTime();
  }, {
    message: "Client signature date must be today's date"
  }),
  clientName: z.string().nonempty("Client name is required"),
  guardianName: z.string().optional(),
  guardianSignature: z.string().optional(),
  guardianSignatureDate: z.string().optional().refine((dateString) => {
  if (!dateString) return true; // Optional field
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate.getTime() === today.getTime();
}, {
  message: "Guardian signature date must be today's date"
}),
  methodQuantity: z.coerce.number().optional(),
}),
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),
  pregnancyCheck: PregnancyCheckSchema.optional(),
});

export const page1Schema = FamilyPlanningBaseSchema.pick({
  pat_id: true,
  patrec_id: true,
  client_id: true,
  
  philhealthNo: true,
  nhts_status: true,
  fourps: true,
  lastName: true,
  givenName: true,
  middleInitial: true,
  dateOfBirth: true,
  age: true,
  educationalAttainment: true,
  occupation: true,
  address: true,
  // spouse: false,
  numOfLivingChildren: true,
  plan_more_children: true,
  avg_monthly_income: true,
  typeOfClient: true,
  subTypeOfClient: true,
  // reasonForFP: true,
  // otherReasonForFP: true,
  // reason: true, // For current user reason
  // otherReason: true, // For current user reason specify
  methodCurrentlyUsed: true,
  // otherMethod: true,
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
  // pelvicExamination: false,
  // cervicalConsistency: false,
  // cervicalTenderness: false,
  // cervicalAdnexal: false,
  // uterinePosition: false,
  // uterineDepth: false,
  bodyMeasurementRecordedAt: true 
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
 if (data.age < 18) {
    if (!data.acknowledgement?.guardianName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian name is required for clients under 18",
        path: ["acknowledgement", "guardianName"]
      });
    }
    if (!data.acknowledgement?.guardianSignature) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian signature is required for clients under 18",
        path: ["acknowledgement", "guardianSignature"]
      });
    }
    if (!data.acknowledgement?.guardianSignatureDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian signature date is required for clients under 18",
        path: ["acknowledgement", "guardianSignatureDate"]
      });
    }
  }


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
    // // For "New Acceptor", reasonForFP and methodCurrentlyUsed are required
    // if (!data.reasonForFP) {
    //   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for family planning is required for new acceptors", path: ["reasonForFP"] });
    // }
    if (!data.methodCurrentlyUsed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Method currently used is required for new acceptors", path: ["methodCurrentlyUsed"] });
    }
    // if (data.reasonForFP === "fp_others" && !data.otherReasonForFP) { // Corrected from "Others (Specify)" to "fp_others" based on your options
    //   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify the reason for FP", path: ["otherReasonForFP"] });
    // }

    // if (data.subTypeOfClient) { // If subTypeOfClient is present when it shouldn't be
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sub-type of client is not applicable for new acceptors", path: ["subTypeOfClient"] });
    // }
    // if (data.reason) { // If reason (for Current User) is present
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason for current user is not applicable for new acceptors", path: ["reason"] });
    // }
    // if (data.otherReasonForFP) { // If other reason (for Current User side effects) is present
    //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specific reason for current user is not applicable for new acceptors", path: ["fpt_other_reason_fp"] });
    // }


  } else if (data.typeOfClient === "currentuser") { // Corrected from "Current User" to "currentuser" based on your options
    // For "Current User", subTypeOfClient is always required
    // if (!data.subTypeOfClient) {
    //   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sub-type of client is required for current users", path: ["subTypeOfClient"] });
    // }

    // Conditional logic based on subTypeOfClient
    if (data.subTypeOfClient === "changingmethod") { // Corrected from "Changing Method" to "changingmethod"
      // if (!data.reason) {
      //   ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason is required for changing method", path: ["reason"] });
      // }
      if (!data.methodCurrentlyUsed) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Method currently used is required for changing method", path: ["methodCurrentlyUsed"] });
      }
      if (data.reason === "Side Effects" && !data.reasonForFP) { // Assuming fpt_other_reason_fp maps to specifying side effects
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
      // if (data.reason) { // Reason for Current User is not needed
      //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason is not applicable for this sub-type", path: ["reason"] });
      // }
      // if (data.reasonForFP) {
      //     ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Specific reason is not applicable for this sub-type", path: ["fpt_other_reason_fp"] });
      // }
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