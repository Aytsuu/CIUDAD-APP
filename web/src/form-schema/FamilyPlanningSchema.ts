import { z } from "zod"

// Define the service provision record schema separately for reuse
// This schema represents a single entry in the array of service provision records
const ServiceProvisionRecordSchema = z.object({
  dateOfVisit: z.string().nonempty("Date of visit is required"),
  methodAccepted: z.string().nonempty("Method accepted is required"),
  nameOfServiceProvider: z.string().nonempty("Service provider name is required"),
  dateOfFollowUp: z.string().nonempty("Follow-up date is required"),
  methodQuantity: z.string().nonempty("Method quantity is required"), // Consider z.coerce.number() if truly a number
  methodUnit: z.string().nonempty("Method unit is required"),
  serviceProviderSignature: z.string().optional(),
  medicalFindings: z.string().optional(),
  // These fields are already coerced to number and have min(1) validation, which handles empty strings as 0.
  weight: z.coerce.number().min(1, "Weight must be at least 1 kg"), // Corrected message for clarity
  bp_systolic: z.coerce.number().min(1, "Systolic BP must be at least 1"),
  bp_diastolic: z.coerce.number().min(1, "Diastolic BP must be at least 1"),
})

// Define the pregnancy check schema
const PregnancyCheckSchema = z.object({ // Renamed for consistency
  breastfeeding: z.boolean().default(false),
  abstained: z.boolean().default(false),
  recent_baby: z.boolean().default(false),
  recent_period: z.boolean().default(false),
  recent_abortion: z.boolean().default(false),
  using_contraceptive: z.boolean().default(false),
})

// Define the complete schema for all pages
const FamilyPlanningBaseSchema = z.object({
  // Page 1 fields
  pat_id: z.string().optional(), // Assumed optional as it might be generated on backend
  fpt_id: z.string().optional(), // Assumed optional as it might be generated on backend
  clientID: z.string().optional(),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean({ required_error: "You must choose Yes or No" }),
  pantawid_4ps: z.boolean(),

  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
  dateOfBirth: z.string().nonempty("Birthdate is required"),
  age: z.coerce.number().min(1, "Age is required and must be a positive number"), // Used coerce.number
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
    s_lastName: z.string().nonempty("Last name is required"),
    s_givenName: z.string().nonempty("Given name is required"),
    s_middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
    s_dateOfBirth: z.string().nonempty("Birthdate is required"),
    s_age: z.coerce.number().min(1, "Age is required and must be a positive number"), // Used coerce.number
    s_occupation: z.string().optional(),
  }),

  numOfLivingChildren: z.coerce.number().min(0, "Number of living children must be 0 or more").optional(), // Added min(0) and message
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().nonempty("Average monthly income is required"), // Consider z.coerce.number() for income

  typeOfClient: z.string().nonempty("Type of client is required"),
  subTypeOfClient: z.string().optional(),

  reasonForFP: z.string().nonempty("Reason for FP is required"),
  otherReasonForFP: z.string().optional(), // Conditionally required via .refine

  reason: z.string().optional(), // Conditionally required via .refine (for changing method reasons)
  fpt_other_reason_fp: z.string().optional(), // This name seems inconsistent with `otherReasonForFP` and `reason`

  methodCurrentlyUsed: z.string().nonempty("Select a method"),
  otherMethod: z.string().optional(),

  // Page 2 fields - Medical History
  medicalHistory: z.object({
    severeHeadaches: z.boolean(),
    strokeHeartAttackHypertension: z.boolean(),
    hematomaBruisingBleeding: z.boolean(),
    breastCancerHistory: z.boolean(),
    severeChestPain: z.boolean(),
    coughMoreThan14Days: z.boolean(),
    jaundice: z.boolean(),
    unexplainedVaginalBleeding: z.boolean(),
    abnormalVaginalDischarge: z.boolean(),
    phenobarbitalOrRifampicin: z.boolean(),
    smoker: z.boolean(),
    disability: z.boolean(),
    disabilityDetails: z.string().optional(), // Conditionally required if disability is true
  }),

  // Page 2 fields - Obstetrical History
  obstetricalHistory: z.object({
    g_pregnancies: z.coerce.number().min(0, "G (Gravida) must be 0 or more").default(0), // Coerce number, improved message
    p_pregnancies: z.coerce.number().min(0, "P (Parity) must be 0 or more").default(0), // Coerce number, improved message
    fullTerm: z.coerce.number().min(0, "Full Term must be 0 or more"), // Coerce number
    premature: z.coerce.number().min(0, "Premature must be 0 or more"), // Coerce number
    abortion: z.coerce.number().min(0, "Abortion must be 0 or more"), // Coerce number
    livingChildren: z.coerce.number().min(0, "Living children must be 0 or more"), // Coerce number

    lastDeliveryDate: z.string().optional(), // Consider non-empty if always applicable
    typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(), // Optional since lastDeliveryDate is optional

    lastMenstrualPeriod: z.string().nonempty("Enter date of last menstrual period"),
    previousMenstrualPeriod: z.string().nonempty("Enter date of previous menstrual period"),

    menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]), // This is required if selected
    dysmenorrhea: z.boolean().default(false),
    hydatidiformMole: z.boolean().default(false),
    ectopicPregnancyHistory: z.boolean().default(false),
  }),

  // Page 3 fields - Sexually Transmitted Infections
  sexuallyTransmittedInfections: z.object({
    abnormalDischarge: z.boolean(),
    dischargeFrom: z.enum(["Vagina", "Penis"]).optional(), // Optional if abnormalDischarge is false
    sores: z.boolean(),
    pain: z.boolean(),
    history: z.boolean(),
    hiv: z.boolean(),
  }),

  // Page 3 fields - Violence Against Women
  violenceAgainstWomen: z.object({
    unpleasantRelationship: z.boolean(),
    partnerDisapproval: z.boolean(),
    domesticViolence: z.boolean(),
    referredTo: z.enum(["DSWD", "WCPU", "NGOs", "Others"]).optional(), // Made optional, if required then refine later
  }),

  // Page 4 fields - Physical Examination
  weight: z.coerce.number().min(1, "Weight must be at least 1 kg"), // Corrected message, using coerce.number
  height: z.coerce.number().min(1, "Height must be at least 1 cm"), // Corrected message, using coerce.number
  // Recommendation: Consider replacing `bloodPressure` string with `bp_systolic` and `bp_diastolic` numbers
  // for consistency with ServiceProvisionRecordSchema and better data typing.
  bloodPressure: z.string().nonempty("Blood pressure is required (e.g., 120/80)"),
  pulseRate: z.coerce.number().min(1, "Pulse rate must be a positive number").optional(), // Added min(1) if required to be positive, made optional

  // Updated examination fields - removed redundant .refine for enums if they are required to have a selection
  skinExamination: z.enum(["normal", "pale", "yellowish", "hematoma", "not_applicable"]),
  conjunctivaExamination: z.enum(["normal", "pale", "yellowish", "not_applicable"]),
  neckExamination: z.enum(["normal", "neck_mass", "enlarged_lymph_nodes", "not_applicable"]),
  breastExamination: z.enum(["normal", "mass", "nipple_discharge", "not_applicable"]),
  abdomenExamination: z.enum(["normal", "abdominal_mass", "varicosities", "not_applicable"]),
  extremitiesExamination: z.enum(["normal", "edema", "varicosities", "not_applicable"]),

  // Pelvic Examination (for IUD Acceptors)
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
  ]).optional(), // Made optional if it depends on `methodCurrentlyUsed` being IUD

  // Cervical Examination
  cervicalConsistency: z.enum(["firm", "soft", "not_applicable"]).optional(), // Made optional, depends on pelvic exam
  cervicalTenderness: z.boolean().optional(), // Made optional
  cervicalAdnexalMassTenderness: z.boolean().optional(), // Made optional

  // Uterine Examination
  uterinePosition: z.enum(["mid", "anteflexed", "retroflexed", "not_applicable"]).optional(), // Made optional
  uterineDepth: z.string().optional(), // Could be z.coerce.number().optional() if it's a measurement

  // Page 5 fields - Acknowledgement
  acknowledgement: z.object({ // CORRECTED: This should be an object
    clientSignature: z.string().optional(),
    // clientName: This field is typically derived from `lastName`, `givenName`, `middleInitial`.
    // It shouldn't be directly entered in the form unless it's a separate input.
    clientSignatureDate: z.string().nonempty("Client signature date is required"),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(),
    guardianSignatureDate: z.string().optional(),
  }),

  // Page 6 fields - Service Provision Records (an array) and Pregnancy Check (an object)
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]), // Array of records
  pregnancyCheck: PregnancyCheckSchema.optional(),
})

// Exporting the main schema with conditional refinements
export const FamilyPlanningSchema = FamilyPlanningBaseSchema
  // Refinement for `otherReasonForFP`
  .refine(
    (data) => {
      if (data.typeOfClient === "New Acceptor" && data.reasonForFP === "Others (Specify)") { // Use actual enum values for comparison
        return !!data.otherReasonForFP
      }
      return true
    },
    {
      message: "Please specify the reason for family planning",
      path: ["otherReasonForFP"],
    },
  )
  // Refinement for `otherReason` (for changing method)
  .refine(
    (data) => {
      if (
        data.typeOfClient === "Current User" && // Use actual enum values
        data.subTypeOfClient === "Changing Method" && // Use actual enum values
        data.reason === "Side Effects" // Use actual enum values
      ) {
        return !!data.fpt_other_reason_fp // Assuming `fpt_other_reason_fp` is the field for this
      }
      return true
    },
    {
      message: "Please specify the side effects",
      path: ["fpt_other_reason_fp"], // Corrected path based on context
    },
  )
  // New: Refinement for `disabilityDetails`
  .refine(
    (data) => {
      if (data.medicalHistory?.disability) {
        return !!data.medicalHistory.disabilityDetails;
      }
      return true;
    },
    {
      message: "Please specify disability details",
      path: ["medicalHistory", "disabilityDetails"],
    }
  )
  // New: Refinement for pelvic exam fields based on methodCurrentlyUsed
  .refine(
    (data) => {
      const isIUD = data.methodCurrentlyUsed?.includes("IUD"); // Or strict comparison like 'IUD'
      if (isIUD) {
        // If IUD is selected, these fields should be non-optional (or have specific error messages)
        return (
          data.pelvicExamination !== undefined &&
          data.cervicalConsistency !== undefined &&
          data.uterinePosition !== undefined
          // Add other required pelvic exam fields here
        );
      }
      return true;
    },
    {
      message: "Pelvic examination details are required for IUD method",
      path: ["pelvicExamination"], // You might need more specific paths for individual fields
    }
  )

// Export page-specific schemas for step-by-step validation
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
  reason: true, // Keep it here if it's part of page 1's inputs
  fpt_other_reason_fp: true, // Keep it here if it's part of page 1's inputs
  methodCurrentlyUsed: true,
  otherMethod: true,
}).superRefine((data, ctx) => {
  // Apply conditional validation from base schema here if relevant to page 1
  if (data.typeOfClient === "New Acceptor" && data.reasonForFP === "Others (Specify)" && !data.otherReasonForFP) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the reason for family planning",
      path: ["otherReasonForFP"],
    });
  }
  // Add other page-1 specific conditional refinements here
});


export const page2Schema = FamilyPlanningBaseSchema.pick({
  medicalHistory: true,
  obstetricalHistory: true,
}).superRefine((data, ctx) => {
  // Apply conditional validation from base schema here if relevant to page 2
  if (data.medicalHistory?.disability && !data.medicalHistory.disabilityDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify disability details",
      path: ["medicalHistory", "disabilityDetails"],
    });
  }
  // Add other page-2 specific conditional refinements here
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
}).superRefine((data, ctx) => {
  // Apply conditional validation for pelvic exam fields if 'methodCurrentlyUsed' (from page 1) is relevant here.
  // This might require passing `methodCurrentlyUsed` into page 4's schema validation context if it's not present here.
  // For now, assuming `methodCurrentlyUsed` is available from the overall form data during full validation.
  // If `page4Schema` is validated independently, you might need a different approach (e.g., passing external context).
});


export const page5Schema = FamilyPlanningBaseSchema.pick({
  acknowledgement: true,
});

export const page6Schema = FamilyPlanningBaseSchema.pick({
  serviceProvisionRecords: true,
}).extend({
  pregnancyCheck: PregnancyCheckSchema.optional(), // Use the consistently named PregnancyCheckSchema
});


// Exporting the schemas properly
export default FamilyPlanningSchema
export type FormData = z.infer<typeof FamilyPlanningSchema>
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>
export type PregnancyCheck = z.infer<typeof PregnancyCheckSchema> // Use the consistently named type