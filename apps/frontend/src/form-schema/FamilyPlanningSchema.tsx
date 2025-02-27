import { z } from "zod";

const FamilyPlanning1 = z.object({
  clientID: z.string().nonempty("Client ID is required"),
  philhealthNo: z.string().nonempty("Philhealth # is required"),
  nhts_status: z.boolean(),
  pantawid_4ps: z.boolean(),
  lastName: z.string().nonempty("Last name is required"),
  givenName: z.string().nonempty("Given name is required"),
  middleInitial: z.string().max(1).optional(),
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
    lastName: z.string().nonempty("Last name is required"),
    givenName: z.string().nonempty("Given name is required"),
    middleInitial: z.string().max(1).optional(),
    dateOfBirth: z.string().nonempty("Birthdate is required"),
    age: z.number().min(0, "Age is required and must be a positive number"),
    occupation: z.string().optional(),
  }),

  numOfLivingChildren: z.number().min(0, "Number of living children is required"),
  planToHaveMoreChildren: z.boolean(),
  averageMonthlyIncome: z.string().optional(),

  typeOfClient: z
    .array(z.enum(["New Acceptor", "Current User", "Changing Method", "Changing Clinic", "Dropout/Restart"]))
    .optional(),

  reasonForFP: z.array(z.enum(["Spacing", "Limiting", "Others"])).optional(),
  otherReasonForFP: z.string().optional(), // For 'Others' input field

  reason: z.array(z.enum(["Medical Condition", "Side Effects"])).optional(),

  methodCurrentlyUsed: z
    .array(
      z.enum([
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
    )
    .optional(),
  otherMethod: z.string().optional(), // For 'Others' input field
});

const FamilyPlanning2 = z.object({
  // Medical History - Yes/No Checkboxes
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
    disabilityDetails: z.string().optional(), // Only required if "disability" is true
  }),

  // Obstetrical History
  obstetricalHistory: z.object({
    pregnancies: z.number().min(0, "Number of pregnancies is required"), // G
    fullTerm: z.number().min(0, "Number of full-term pregnancies is required"),
    premature: z.number().min(0, "Number of premature births is required"),
    abortion: z.number().min(0, "Number of abortions is required"),
    livingChildren: z.number().min(0, "Number of living children is required"),

    lastDeliveryDate: z.string().optional(), // Can validate date format further
    typeOfLastDelivery: z.enum(["Vaginal", "Cesarean"]).optional(),

    lastMenstrualPeriod: z.string().optional(), // Can validate date format further
    previousMenstrualPeriod: z.string().optional(), // Can validate date format further

    // Menstrual Flow & Conditions
    menstrualFlow: z.enum(["Scanty", "Moderate", "Heavy"]).optional(),
    dysmenorrhea: z.boolean(),
    hydatidiformMole: z.boolean(),
    ectopicPregnancyHistory: z.boolean(),
  }),
});

// Exporting the schemas properly
export { FamilyPlanning1, FamilyPlanning2 };
  