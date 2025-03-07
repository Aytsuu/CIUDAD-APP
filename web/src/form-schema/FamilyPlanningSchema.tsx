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

export const FamilyPlanningSchema = z.object({
  clientID: z.string().nonempty("Client ID is required"),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean(),
  pantawid_4ps: z.boolean(),

  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1, "Middle Initial must be 1 character only ").optional(),
  dateOfBirth: z.string().nonempty("Birthdate is required"),
  age: z.number().min(0, "Age is required and must be a positive number"),
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
    s_middleInitial: z.string().max(1, "Middle Initial must be 1 character only ").optional(),
    s_dateOfBirth: z.string().nonempty("Birthdate is required"),
    s_age: z.number().min(0, "Age is required and must be a positive number"),
    s_occupation: z.string().optional(),
  }),

  numOfLivingChildren: z.number().min(0, "Number of living children is required"),
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().optional(),

  typeOfClient: z.string().nonempty("Required"),
  subTypeOfClient: z.string().nonempty("Required"),

  reasonForFP: z.string().nonempty("Required"),
  otherReasonForFP: z.string().optional(),

  reason: z.string().nonempty("Required"),

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

    // Menstrual Flow & Conditions
    menstrualFlow: z.array(z.enum(["Scanty", "Moderate", "Heavy"])).optional(),
    dysmenorrhea: z.boolean(),
    hydatidiformMole: z.boolean(),
    ectopicPregnancyHistory: z.boolean(),
  }),

  // **Newly Added Section: Risks for Sexually Transmitted Infections**
  sexuallyTransmittedInfections: z.object({
    abnormalDischarge: z.boolean(),
    dischargeFrom: z.array(z.enum(["Vagina", "Penis"])).optional(),
    sores: z.boolean(),
    pain: z.boolean(),
    history: z.boolean(),
    hiv: z.boolean(),
  }),

  // **Newly Added Section: Risks for Violence Against Women (VAW)**
  violenceAgainstWomen: z.object({
    unpleasantRelationship: z.boolean(),
    partnerDisapproval: z.boolean(),
    domesticViolence: z.boolean(),
    referredTo: z.array(z.enum(["DSWD", "WCPU", "NGOs", "Others"])).optional(),
    otherReferral: z.string().optional().nullable(),
  }),
  weight: z.string().optional(),
  height: z.string().optional(),
  bloodPressure: z.string().optional(),
  pulseRate: z.string().optional(),

  // Skin Examination
  skinNormal: z.boolean().optional(),
  skinPale: z.boolean().optional(),
  skinYellowish: z.boolean().optional(),
  skinHematoma: z.boolean().optional(),

  // Conjunctiva Examination
  conjunctivaNormal: z.boolean().optional(),
  conjunctivaPale: z.boolean().optional(),
  conjunctivaYellowish: z.boolean().optional(),

  // Neck Examination
  neckNormal: z.boolean().optional(),
  neckMass: z.boolean().optional(),
  neckEnlargedLymphNodes: z.boolean().optional(),

  // Breast Examination
  breastNormal: z.boolean().optional(),
  breastMass: z.boolean().optional(),
  breastNippleDischarge: z.boolean().optional(),

  // Abdomen Examination
  abdomenNormal: z.boolean().optional(),
  abdomenMass: z.boolean().optional(),
  abdomenVaricosities: z.boolean().optional(),

  // Extremities Examination
  extremitiesNormal: z.boolean().optional(),
  extremitiesEdema: z.boolean().optional(),
  extremitiesVaricosities: z.boolean().optional(),

  // Pelvic Examination (for IUD Acceptors)
  pelvicNormal: z.boolean().optional(),
  pelvicMass: z.boolean().optional(),
  pelvicAbnormalDischarge: z.boolean().optional(),
  pelvicCervicalAbnormalities: z.boolean().optional(),
  pelvicWarts: z.boolean().optional(),
  pelvicPolypOrCyst: z.boolean().optional(),
  pelvicInflammationOrErosion: z.boolean().optional(),
  pelvicBloodyDischarge: z.boolean().optional(),

  // Cervical Examination
  cervicalConsistencyFirm: z.boolean().optional(),
  cervicalConsistencySoft: z.boolean().optional(),
  cervicalTenderness: z.boolean().optional(),
  cervicalAdnexalMassTenderness: z.boolean().optional(),

  // Uterine Examination
  uterinePositionMid: z.boolean().optional(),
  uterinePositionAnteflexed: z.boolean().optional(),
  uterinePositionRetroflexed: z.boolean().optional(),
  uterineDepth: z.string().optional(),

  // Acknowledgement Form
  acknowledgement: z.object({
    selectedMethod: z.enum([
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
    ]),
    clientSignature: z.string().optional(), // Base64 string of signature
    clientSignatureDate: z.string().optional(),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(), // Base64 string of signature
    guardianSignatureDate: z.string().optional(),
  }),

  // Service Provision Records array
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),
})

// Exporting the schemas properly
export default FamilyPlanningSchema
export type FormData = z.infer<typeof FamilyPlanningSchema>
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>

