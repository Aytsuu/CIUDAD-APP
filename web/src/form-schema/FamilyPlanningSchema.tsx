import { z } from "zod"

// Define the service provision record schema separately for reuse
const ServiceProvisionRecordSchema = z.object({
  dateOfVisit: z.string().nonempty("Date of visit is required"),
  methodAccepted: z.string().nonempty("Method is required"),
  nameOfServiceProvider: z.string().nonempty("Service provider name is required"),
  dateOfFollowUp: z.string().nonempty("Follow-up date is required"),
  // Optional fields
  methodQuantity: z.string().optional(),
  methodUnit: z.string().optional(),
  serviceProviderSignature: z.string().optional(),
  medicalFindings: z.string().optional(),
})

// Define the complete schema for all pages
export const FamilyPlanningSchema = z.object({
  // Page 1 fields
  clientID: z.string().nonempty("Client ID is required"),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean(),
  pantawid_4ps: z.boolean(),

  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1, "Middle Initial must be 1 character only").optional(),
  dateOfBirth: z.string().nonempty("Birthdate is required"),
  age: z.number().min(1, "Age is required and must be a positive number"),
  educationalAttainment: z.string().nonempty("Educational Attainment is required"),
  occupation: z.string().optional(),

  address: z.object({
    houseNumber: z.string().optional(),
    street: z.string().nonempty("Street is required"),
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

  numOfLivingChildren: z.number().min(1, "Number of living children is required"),
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().optional(),

  typeOfClient: z.string().nonempty("Type of client is required"),
  subTypeOfClient: z.string().optional(),

  reasonForFP: z.string().optional(),
  otherReasonForFP: z.string().optional(),

  reason: z.string().optional(),

  methodCurrentlyUsed: z
    .enum([
      "COC",
      "POP",
      "Injectable",
      "Implant",
      "IUD",
      "Interval",
      "Post Partum",
      "Condom",
      "BOM/CMM",
      "BBT",
      "STM",
      "SDM",
      "LAM",
      "Others",
    ])
    .optional(),

  otherMethod: z.string().optional(), // For 'Others' input field

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
    g_pregnancies: z.number().min(0, "Number of pregnancies is required").default(0),
    p_pregnancies: z.number().min(0, "Number of pregnancies is required").default(0),
    fullTerm: z.number().min(0, "Number of full-term pregnancies is required"),
    premature: z.number().min(0, "Number of premature births is required"),
    abortion: z.number().min(0, "Number of abortions is required"),
    livingChildren: z.number().min(0, "Number of living children is required"),

    lastDeliveryDate: z.string().optional(),
    typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(),

    lastMenstrualPeriod: z.string().optional(),
    previousMenstrualPeriod: z.string().optional(),

    // Changed from array to string for radio button selection
    menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]).optional(),
    dysmenorrhea: z.boolean().default(false),
    hydatidiformMole: z.boolean().default(false),
    ectopicPregnancyHistory: z.boolean().default(false),
  }),

  // Page 3 fields
  sexuallyTransmittedInfections: z.object({
    abnormalDischarge: z.boolean(),
    dischargeFrom: z.array(z.enum(["Vagina", "Penis"])).optional(),
    sores: z.boolean(),
    pain: z.boolean(),
    history: z.boolean(),
    hiv: z.boolean(),
  }),

  violenceAgainstWomen: z.object({
    unpleasantRelationship: z.boolean(),
    partnerDisapproval: z.boolean(),
    domesticViolence: z.boolean(),
    referredTo: z.array(z.enum(["DSWD", "WCPU", "NGOs", "Others"])).optional(),
    otherReferral: z.string().optional().nullable(),
  }),

  // Page 4 fields - Updated for radio buttons
  weight: z.string().nonempty("Weight is required"),
  height: z.string().nonempty("Height is required"),
  bloodPressure: z.string().nonempty("Blood pressure is required"),
  pulseRate: z.string().nonempty("Pulse rate is required"),

  // Updated examination fields to use radio buttons
  skinExamination: z.enum(["normal", "pale", "yellowish", "hematoma", "not_applicable"]).default("not_applicable"),
  conjunctivaExamination: z.enum(["normal", "pale", "yellowish", "not_applicable"]).default("not_applicable"),
  neckExamination: z.enum(["normal", "neck_mass", "enlarged_lymph_nodes", "not_applicable"]).default("not_applicable"),
  breastExamination: z.enum(["normal", "mass", "nipple_discharge", "not_applicable"]).default("not_applicable"),
  abdomenExamination: z.enum(["normal", "abdominal_mass", "varicosities", "not_applicable"]).default("not_applicable"),
  extremitiesExamination: z.enum(["normal", "edema", "varicosities", "not_applicable"]).default("not_applicable"),

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
    .default("not_applicable"),

  // Cervical Examination
  cervicalConsistency: z.enum(["firm", "soft", "not_applicable"]).default("not_applicable"),
  cervicalTenderness: z.boolean().default(false),
  cervicalAdnexalMassTenderness: z.boolean().default(false),

  // Uterine Examination
  uterinePosition: z.enum(["mid", "anteflexed", "retroflexed", "not_applicable"]).default("not_applicable"),
  uterineDepth: z.string().optional(),

  // Remove old checkbox fields that are now replaced by radio buttons
  skinNormal: z.boolean().optional(),
  skinPale: z.boolean().optional(),
  skinYellowish: z.boolean().optional(),
  skinHematoma: z.boolean().optional(),
  conjunctivaNormal: z.boolean().optional(),
  conjunctivaPale: z.boolean().optional(),
  conjunctivaYellowish: z.boolean().optional(),
  neckNormal: z.boolean().optional(),
  neckMass: z.boolean().optional(),
  neckEnlargedLymphNodes: z.boolean().optional(),
  breastNormal: z.boolean().optional(),
  breastMass: z.boolean().optional(),
  breastNippleDischarge: z.boolean().optional(),
  abdomenNormal: z.boolean().optional(),
  abdomenMass: z.boolean().optional(),
  abdomenVaricosities: z.boolean().optional(),
  extremitiesNormal: z.boolean().optional(),
  extremitiesEdema: z.boolean().optional(),
  extremitiesVaricosities: z.boolean().optional(),
  pelvicNormal: z.boolean().optional(),
  pelvicMass: z.boolean().optional(),
  pelvicAbnormalDischarge: z.boolean().optional(),
  pelvicCervicalAbnormalities: z.boolean().optional(),
  pelvicWarts: z.boolean().optional(),
  pelvicPolypOrCyst: z.boolean().optional(),
  pelvicInflammationOrErosion: z.boolean().optional(),
  pelvicBloodyDischarge: z.boolean().optional(),
  cervicalConsistencyFirm: z.boolean().optional(),
  cervicalConsistencySoft: z.boolean().optional(),
  uterinePositionMid: z.boolean().optional(),
  uterinePositionAnteflexed: z.boolean().optional(),
  uterinePositionRetroflexed: z.boolean().optional(),

  // Page 5 fields
  acknowledgement: z.object({
    selectedMethod: z
      .enum([
        "coc",
        "iud",
        "bom/cmm",
        "lam",
        "pop",
        "interval",
        "bbt",
        "sdm",
        "injectable",
        "postpartum",
        "stm",
        "implant",
        "condom",
        "others",
      ], {
        required_error: "Please select a method",
      }),
    clientSignature: z.string().optional(), // Base64 string of signature
    clientSignatureDate: z.string().nonempty("Client signature date is required"),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(), // Base64 string of signature
    guardianSignatureDate: z.string().optional(),
  }),

  // Page 6 fields
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),
})

// Create page-specific schemas by picking fields from the main schema
// This avoids duplication of field definitions
export const page1Schema = FamilyPlanningSchema.pick({
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
  methodCurrentlyUsed: true,
  otherMethod: true,
})

export const page2Schema = FamilyPlanningSchema.pick({
  medicalHistory: true,
  obstetricalHistory: true,
})

export const page3Schema = FamilyPlanningSchema.pick({
  sexuallyTransmittedInfections: true,
  violenceAgainstWomen: true,
})

export const page4Schema = FamilyPlanningSchema.pick({
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

export const page5Schema = FamilyPlanningSchema.pick({
  acknowledgement: true,
})

export const page6Schema = FamilyPlanningSchema.pick({
  serviceProvisionRecords: true,
})

// Exporting the schemas properly
export default FamilyPlanningSchema
export type FormData = z.infer<typeof FamilyPlanningSchema>
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>

