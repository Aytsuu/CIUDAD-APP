// import { z } from "zod"

// // Define the service provision record schema separately for reuse
// const ServiceProvisionRecordSchema = z.object({
//   dateOfVisit: z.string().nonempty("Date of visit is required"),
//   methodAccepted: z.string().nonempty("Method is required"),
//   nameOfServiceProvider: z.string().nonempty("Service provider name is required"),
//   dateOfFollowUp: z.string().nonempty("Follow-up date is required"),
//   methodQuantity: z.string().nonempty("Method quantity is required"),
//   methodUnit: z.string().nonempty("Method unit is required"),
//   serviceProviderSignature: z.string().optional(),
//   medicalFindings: z.string().optional(),
//   weight: z.number().min(1, "Weight is required"),
//   bp_systolic: z.number().min(1, "Systolic BP is required"),
//   bp_diastolic: z.number().min(1, "Diastolic BP is required"),
// })

// // Define the pregnancy check schema
// const pregnancyCheck = z.object({
//   breastfeeding: z.boolean().default(false),
//   abstained: z.boolean().default(false),
//   recent_baby: z.boolean().default(false),
//   recent_period: z.boolean().default(false),
//   recent_abortion: z.boolean().default(false),
//   using_contraceptive: z.boolean().default(false),
// });


// // Define the complete schema for all pages
// export const FamilyPlanningSchema = z.object({
//   pat_id: z.string(),
//   fpt_id: z.string(),
//   clientID: z.string().optional(),
//   philhealthNo: z.string().optional(),
//   nhts_status: z.boolean({required_error: "You must choose Yes or No"}),
//   pantawid_4ps: z.boolean(),

//   lastName: z.string().nonempty("Last name is required"),
//   givenName: z.string().nonempty("Given name is required"),
//   middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
//   dateOfBirth: z.string().nonempty("Birthdate is required"),
//   age: z.number().min(1, "Age is required and must be a positive number"),
//   educationalAttainment: z.string().nonempty("Educational Attainment is required"),
//   occupation: z.string().optional(),
//   isTransient: z.string().default("Resident"),

//   address: z.object({
//     houseNumber: z.string().optional(),
//     street: z.string().optional(),
//     barangay: z.string().nonempty("Barangay is required"),
//     municipality: z.string().nonempty("Municipality/City is required"),
//     province: z.string().nonempty("Province is required"),
//   }), 

//   spouse: z.object({
//     s_lastName: z.string().nonempty("Last name is required"),
//     s_givenName: z.string().nonempty("Given name is required"),
//     s_middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
//     s_dateOfBirth: z.string().nonempty("Birthdate is required"),
//     s_age: z.number().min(1, "Age is required and must be a positive number"),
//     s_occupation: z.string().optional(),
//   }),

//   // pregnancyCheck: z.object({
//   //   bf_no_menses: z.boolean().default(false),
//   //   abstained_last_period: z.boolean().default(false),
//   //   had_baby: z.boolean().default(false),
//   //   period_within: z.boolean().default(false),
//   //   miscarriage_or_abortion: z.boolean().default(false),
//   //   using_contraceptive: z.boolean().default(false),
//   // }),
  
//   numOfLivingChildren: z.number().min(0, "Number of living children is required"),
//   planToHaveMoreChildren: z.boolean(),
//   averageMonthlyIncome: z.string().nonempty("Average monthly income is required"),

//   typeOfClient: z.string().nonempty("Type of client is required"),
//   subTypeOfClient: z.string().nonempty("Sub-type of client is required"),

//   reasonForFP: z.string().nonempty("Reason for family planning is required"),
//   // Current user reason
//   reason: z.string().nonempty("Reason is required"), 
//   otherReason: z.string().nonempty("bogo ka haha"),
//   sideeffects: z.string().nonempty("Side effects are required"),
//   methodCurrentlyUsed: z
//     .enum([
//       "COC",
//       "POP",
//       "Injectable",
//       "Implant",
//       "IUD-Interval",
//       "IUD-Post Partum",
//       "Condom",
//       "BOM/CMM",
//       "BBT",
//       "STM",
//       "SDM",
//       "LAM",
//       "Others",
 
//       "Pills",
//       "DMPA",
//       "Lactating Amenorrhea",
//       "Bilateral Tubal Ligation",
//       "Vasectomy",
//       "Source",
//     ]),

//   otherMethod: z.string().nonempty("Specify other method"),

//   // Page 2 fields
//   medicalHistory: z.object({
//     severeHeadaches: z.boolean(),
//     strokeHeartAttackHypertension: z.boolean(),
//     hematomaBruisingBleeding: z.boolean(),
//     breastCancerHistory: z.boolean(),
//     severeChestPain: z.boolean(),
//     coughMoreThan14Days: z.boolean(),
//     jaundice: z.boolean(),
//     unexplainedVaginalBleeding: z.boolean(),
//     abnormalVaginalDischarge: z.boolean(),
//     phenobarbitalOrRifampicin: z.boolean(),
//     smoker: z.boolean(),
//     disability: z.boolean(),
//     disabilityDetails: z.string().nonempty("Specify disability details"),
//   }),

//   // Obstetrical History
//   obstetricalHistory: z.object({
//     g_pregnancies: z.number().min(0, "Put 0 if none").default(0),
//     p_pregnancies: z.number().min(0, "Put 0 if none").default(0),
//     fullTerm: z.number().min(0, "Put 0 if none"),
//     premature: z.number().min(0, "Number of premature births is required"),
//     abortion: z.number().min(0, "Number of abortions is required"),
//     livingChildren: z.number().min(0, "Number of living children is required"),

//     lastDeliveryDate: z.string().optional(),
//     typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(),

//     lastMenstrualPeriod: z.string().nonempty("Enter date of last menstrual period"),
//     previousMenstrualPeriod: z.string().nonempty("Enter date of previous menstrual period"),

//     // Changed from array to string for radio button selection
//     menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]),
//     dysmenorrhea: z.boolean().default(false),
//     hydatidiformMole: z.boolean().default(false),
//     ectopicPregnancyHistory: z.boolean().default(false),
//   }),

//   // Page 3 fields
//   sexuallyTransmittedInfections: z.object({
//     abnormalDischarge: z.boolean(),
//     dischargeFrom: z.enum(["Vagina", "Penis"]).optional(),
//     sores: z.boolean(),
//     pain: z.boolean(),
//     history: z.boolean(),
//     hiv: z.boolean(),
//   }),

//   violenceAgainstWomen: z.object({
//     unpleasantRelationship: z.boolean(),
//     partnerDisapproval: z.boolean(),
//     domesticViolence: z.boolean(),
//     referredTo: z
//     .enum(["DSWD", "WCPU", "NGOs", "Others"])
//     .refine((val) => val !== undefined, { message: "Please choose referral" }),

//   }),

//   // Physical Examination Fields
//   weight: z.string().nonempty("Weight is required"),
//   height: z.string().nonempty("Height is required"),
//   bloodPressure: z.string().nonempty("Blood pressure is required"),
//   pulseRate: z.string().nonempty("Pulse rate is required"),

//   // Updated examination fields with required selections
//   skinExamination: z
//     .enum(["normal", "pale", "yellowish", "hematoma", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select skin examination result" }),
//   conjunctivaExamination: z
//     .enum(["normal", "pale", "yellowish", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select conjunctiva examination result" }),
//   neckExamination: z
//     .enum(["normal", "neck_mass", "enlarged_lymph_nodes", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select neck examination result" }),
//   breastExamination: z
//     .enum(["normal", "mass", "nipple_discharge", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select breast examination result" }),
//   abdomenExamination: z
//     .enum(["normal", "abdominal_mass", "varicosities", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select abdomen examination result" }),
//   extremitiesExamination: z
//     .enum(["normal", "edema", "varicosities", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select extremities examination result" }),

//   // Pelvic Examination (for IUD Acceptors)
//   pelvicExamination: z
//     .enum(["normal","mass","abnormal_discharge","cervical_abnormalities","warts","polyp_or_cyst","inflammation_or_erosion","bloody_discharge","not_applicable",])
//     .refine((val) => val !== undefined, { message: "Please select pelvic examination result" }),

//   // Cervical Examination
//   cervicalConsistency: z
//     .enum(["firm", "soft", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select cervical consistency" }),
//   cervicalTenderness: z.boolean(),
//   cervicalAdnexalMassTenderness: z.boolean(),

//   // Uterine Examination
//   uterinePosition: z
//     .enum(["mid", "anteflexed", "retroflexed", "not_applicable"])
//     .refine((val) => val !== undefined, { message: "Please select uterine position" }),
//   uterineDepth: z.string().nonempty("Uterine depth is required"),

//   // Page 5 fields
//   acknowledgement: z.object({
//     selectedMethod: z
//       .enum(["coc","bom/cmm","lam","pop","iud-interval","iud-postpartum","bbt","sdm","injectable","stm","implant","condom","others",])
//       .refine((val) => val !== undefined, { message: "Please select a method" }),
//     clientSignature: z.string().nonempty("Client signature date is required"),
//     clientName: z.string().nonempty("Name is required"),
//     clientSignatureDate: z.string().nonempty("Client signature date is required"),
//     guardianName: z.string().optional(),
//     guardianSignature: z.string().nonempty("Signature date is required"),
//     guardianSignatureDate: z.string().optional(),
//   }),

//   // Page 6 fields
//   serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),

//   // Pregnancy Check fields
//   pregnancy_check: pregnancyCheck.optional(),
// })

// // Create page-specific schemas by picking fields from the main schema
// // This avoids duplication of field definitions
// export const page1Schema = FamilyPlanningSchema.pick({
//   clientID: true,
//   philhealthNo: true,
//   nhts_status: true,
//   pantawid_4ps: true,
//   lastName: true,
//   givenName: true,
//   middleInitial: true,
//   dateOfBirth: true,
//   age: true,
//   educationalAttainment: true,
//   occupation: true,
//   address: true,
//   spouse: true,
//   numOfLivingChildren: true,
//   planToHaveMoreChildren: true,
//   averageMonthlyIncome: true,
//   typeOfClient: true,
//   subTypeOfClient: true,
//   reasonForFP: true,
//   reason: true,
//   methodCurrentlyUsed: true,
//   otherMethod: true,
//   isTransient: true,
// })

// export const page2Schema = FamilyPlanningSchema.pick({
//   medicalHistory: true,
//   obstetricalHistory: true,
// })

// export const page3Schema = FamilyPlanningSchema.pick({
//   sexuallyTransmittedInfections: true,
//   violenceAgainstWomen: true,
// })

// export const page4Schema = FamilyPlanningSchema.pick({
//   weight: true,
//   height: true,
//   bloodPressure: true,
//   pulseRate: true,
//   skinExamination: true,
//   conjunctivaExamination: true,
//   neckExamination: true,
//   breastExamination: true,
//   abdomenExamination: true,
//   extremitiesExamination: true,
//   pelvicExamination: true,
//   cervicalConsistency: true,
//   cervicalTenderness: true,
//   cervicalAdnexalMassTenderness: true,
//   uterinePosition: true,
//   uterineDepth: true,
// })

// export const page5Schema = FamilyPlanningSchema.pick({
//   acknowledgement: true,
// })

// export const page6Schema = FamilyPlanningSchema.pick({
//   serviceProvisionRecords: true,
// }).extend({
//   pregnancyCheck: pregnancyCheck.optional(),
// })

// // Exporting the schemas properly
// export default FamilyPlanningSchema
// export type FormData = z.infer<typeof FamilyPlanningSchema>
// export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>
// export type PregnancyCheck = z.infer<typeof pregnancyCheck>




import { z } from "zod"

// Define the service provision record schema separately for reuse
const ServiceProvisionRecordSchema = z.object({
  dateOfVisit: z.string().nonempty("Date of visit is required"),
  methodAccepted: z.string().nonempty("Method is required"),
  nameOfServiceProvider: z.string().nonempty("Service provider name is required"),
  dateOfFollowUp: z.string().nonempty("Follow-up date is required"),
  methodQuantity: z.string().nonempty("Method quantity is required"),
  methodUnit: z.string().nonempty("Method unit is required"),
  serviceProviderSignature: z.string().optional(),
  medicalFindings: z.string().optional(),
  weight: z.number().min(1, "Weight is required"),
  bp_systolic: z.number().min(1, "Systolic BP is required"),
  bp_diastolic: z.number().min(1, "Diastolic BP is required"),
})

// Define the pregnancy check schema
const pregnancyCheck = z.object({
  breastfeeding: z.boolean().default(false),
  abstained: z.boolean().default(false),
  recent_baby: z.boolean().default(false),
  recent_period: z.boolean().default(false),
  recent_abortion: z.boolean().default(false),
  using_contraceptive: z.boolean().default(false),
})

// Define the complete schema for all pages
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
  age: z.number().min(1, "Age is required and must be a positive number"),
  educationalAttainment: z.string().nonempty("Educational Attainment is required"),
  occupation: z.string().optional(),
  isTransient: z.string().default("Resident"),

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
    s_age: z.number().min(1, "Age is required and must be a positive number"),
    s_occupation: z.string().optional(),
  }),

  numOfLivingChildren: z.number().min(0, "Number of living children is required"),
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().nonempty("Average monthly income is required"),

  typeOfClient: z.string().nonempty("Type of client is required"),
  subTypeOfClient: z.string().optional(),

  // Conditional validation for reasonForFP and otherReasonForFP
  reasonForFP: z.string().optional(),
  otherReasonForFP: z.string().optional(),

  // Conditional validation for reason and otherReason
  reason: z.string().optional(),
  otherReason: z.string().optional(),

  methodCurrentlyUsed: z
    .enum([
      "coc",
      "pop",
      "injectable",
      "implant",
      "iud-interval",
      "iud-postpartum",
      "condom",
      "bom/cmm",
      "bbt",
      "stm",
      "sdm",
      "lam",
      "others",
      "pills",
      "dmpa",
      "lactating",
      "bilateral",
      "vasectomy",
    ])
    .optional(),

  otherMethod: z.string().optional(),

  // Page 2 fields
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
    disabilityDetails: z.string().optional(),
  }),

  // Obstetrical History
  obstetricalHistory: z.object({
    g_pregnancies: z.number().min(0, "Put 0 if none").default(0),
    p_pregnancies: z.number().min(0, "Put 0 if none").default(0),
    fullTerm: z.number().min(0, "Put 0 if none"),
    premature: z.number().min(0, "Number of premature births is required"),
    abortion: z.number().min(0, "Number of abortions is required"),
    livingChildren: z.number().min(0, "Number of living children is required"),

    lastDeliveryDate: z.string().optional(),
    typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(),

    lastMenstrualPeriod: z.string().nonempty("Enter date of last menstrual period"),
    previousMenstrualPeriod: z.string().nonempty("Enter date of previous menstrual period"),

    // Changed from array to string for radio button selection
    menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]),
    dysmenorrhea: z.boolean().default(false),
    hydatidiformMole: z.boolean().default(false),
    ectopicPregnancyHistory: z.boolean().default(false),
  }),

  // Page 3 fields
  sexuallyTransmittedInfections: z.object({
    abnormalDischarge: z.boolean(),
    dischargeFrom: z.enum(["Vagina", "Penis"]).optional(),
    sores: z.boolean(),
    pain: z.boolean(),
    history: z.boolean(),
    hiv: z.boolean(),
  }),

  violenceAgainstWomen: z.object({
    unpleasantRelationship: z.boolean(),
    partnerDisapproval: z.boolean(),
    domesticViolence: z.boolean(),
    referredTo: z
      .enum(["DSWD", "WCPU", "NGOs", "Others"])
      .refine((val) => val !== undefined, { message: "Please choose referral" }),
  }),

  // Physical Examination Fields
  weight: z.string().nonempty("Weight is required"),
  height: z.string().nonempty("Height is required"),
  bloodPressure: z.string().nonempty("Blood pressure is required"),
  pulseRate: z.string().nonempty("Pulse rate is required"),

  // Updated examination fields with required selections
  skinExamination: z
    .enum(["normal", "pale", "yellowish", "hematoma", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select skin examination result" }),
  conjunctivaExamination: z
    .enum(["normal", "pale", "yellowish", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select conjunctiva examination result" }),
  neckExamination: z
    .enum(["normal", "neck_mass", "enlarged_lymph_nodes", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select neck examination result" }),
  breastExamination: z
    .enum(["normal", "mass", "nipple_discharge", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select breast examination result" }),
  abdomenExamination: z
    .enum(["normal", "abdominal_mass", "varicosities", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select abdomen examination result" }),
  extremitiesExamination: z
    .enum(["normal", "edema", "varicosities", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select extremities examination result" }),

  // Pelvic Examination (for IUD Acceptors)
  pelvicExamination: z
    .enum([
      "normal",
      "mass",
      "abnormal_discharge",
      "cervical_abnormalities",
      "warts",
      "polyp_or_cyst",
      "inflammation_or_erosion",
      "bloody_discharge",
      "not_applicable",
    ])
    .refine((val) => val !== undefined, { message: "Please select pelvic examination result" }),

  // Cervical Examination
  cervicalConsistency: z
    .enum(["firm", "soft", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select cervical consistency" }),
  cervicalTenderness: z.boolean(),
  cervicalAdnexalMassTenderness: z.boolean(),

  // Uterine Examination
  uterinePosition: z
    .enum(["mid", "anteflexed", "retroflexed", "not_applicable"])
    .refine((val) => val !== undefined, { message: "Please select uterine position" }),
  uterineDepth: z.string().optional(),

  // Page 5 fields
  acknowledgement: z.object({
    selectedMethod: z
      .enum([
        "coc",
        "bom/cmm",
        "lam",
        "pop",
        "iud-interval",
        "iud-postpartum",
        "bbt",
        "sdm",
        "injectable",
        "stm",
        "implant",
        "condom", 
      ])
      .refine((val) => val !== undefined, { message: "Please select a method" }),
    clientSignature: z.string().optional(),
    clientName: z.string().optional(),
    clientSignatureDate: z.string().nonempty("Client signature date is required"),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(),
    guardianSignatureDate: z.string().optional(),
  }),

  // Page 6 fields
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),

  // Pregnancy Check fields
  pregnancyCheck: pregnancyCheck.optional(),
});

export const FamilyPlanningSchema = FamilyPlanningBaseSchema
  .refine(
    (data) => {
      // If typeOfClient is "newacceptor" and reasonForFP is "fp_others", otherReasonForFP is required
      if (data.typeOfClient === "newacceptor" && data.reasonForFP === "fp_others") {
        return !!data.otherReasonForFP
      }
      return true
    },
    {
      message: "Please specify the reason for family planning",
      path: ["otherReasonForFP"],
    },
  )
  .refine(
    (data) => {
      // If typeOfClient is "currentuser", subTypeOfClient is "changingmethod", and reason is "sideeffects", otherReason is required
      if (
        data.typeOfClient === "currentuser" &&
        data.subTypeOfClient === "changingmethod" &&
        data.reason === "sideeffects"
      ) {
        return !!data.otherReason
      }
      return true
    },
    {
      message: "Please specify the side effects",
      path: ["otherReason"],
    },
  )

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
  reason: true,
  otherReason: true,
  methodCurrentlyUsed: true,
  otherMethod: true,
  isTransient: true,
})

export const page2Schema = FamilyPlanningBaseSchema.pick({
  medicalHistory: true,
  obstetricalHistory: true,
})

export const page3Schema = FamilyPlanningBaseSchema.pick({
  sexuallyTransmittedInfections: true,
  violenceAgainstWomen: true,
})

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
})

export const page5Schema = FamilyPlanningBaseSchema.pick({
  acknowledgement: true,
})

export const page6Schema = FamilyPlanningBaseSchema.pick({
  serviceProvisionRecords: true,
}).extend({
  pregnancyCheck: pregnancyCheck.optional(),
})


// Exporting the schemas properly
export default FamilyPlanningSchema
export type FormData = z.infer<typeof FamilyPlanningSchema>
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>
export type PregnancyCheck = z.infer<typeof pregnancyCheck>
