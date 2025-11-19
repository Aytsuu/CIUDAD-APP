import { z } from "zod"

const today = new Date()
today.setHours(0, 0, 0, 0)


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
    z
      .union([
        z.literal(null),
        z.string().refine(
          (dateString) => {
            if (!dateString) return true // Allow null/empty

            const date = new Date(dateString)
            date.setHours(0, 0, 0, 0) // Normalize time for comparison

            // Check if date is today or in the past
            const isTodayOrPast = date <= today
            // Check if date is on weekend
            const isOnWeekend = isWeekend(date)

            // Return false if date is today/past OR on weekend
            return !isTodayOrPast && !isOnWeekend
          },
          {
            message: "Follow-up date must be a future date, and cannot be on weekends",
          },
        ),
      ])
      .optional(),
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
})

const FamilyPlanningBaseSchema = z.object({
  pat_id: z.string().optional(),
  patrec_id: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .optional(),
  // fpt_id: z.string().optional(),
  client_id: z.string().optional(),
  philhealthNo: z.string().optional(),
  nhts_status: z.boolean().optional(),
  fourps: z.boolean().optional(),
  skinExamination: z.string().optional(),
  staff_id: z.string().optional(),
  conjunctivaExamination: z.string().optional(),
  neckExamination: z.string().optional(),
  breastExamination: z.string().optional(),
  abdomenExamination: z.string().optional(),
  pelvicExamination: z.string().optional(),
  extremitiesExamination: z.string().optional(),
  cervicalConsistency: z.string().optional(),
  cervicalTenderness: z.string().optional(),
  cervicalAdnexal: z.string().optional(),
  uterinePosition: z.string().optional(),
  uterineDepth: z.string().optional(),

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

  spouse: z
    .object({
      s_lastName: z.string().optional(),
      s_givenName: z.string().optional(),
      s_middleInitial: z.string().max(1).optional(),
      s_dateOfBirth: z.string().optional(),
      s_age: z.coerce.number().optional(),
      s_occupation: z.string().optional(),
    })
    .optional(),

  numOfLivingChildren: z.coerce.number().min(0).max(20).optional(),
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
  fp_type: z.object({
    fpt_reason: z.string().optional(),
    fpt_reason_fp: z.string().optional(),
    fpt_other_reason_fp: z.string().optional(),
  }),
  previousMethod: z.string().optional(),

  methodCurrentlyUsed: z.string().optional(),
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
  }),

  num_of_children: z.number().min(0).optional(),
  obstetricalHistory: z.object({
    g_pregnancies: z.coerce.number().min(0).max(20).default(0),
    p_pregnancies: z.coerce.number().min(0).max(20).default(0),
    fullTerm: z.coerce.number().min(0).max(20),
    premature: z.coerce.number().min(0).max(20),
    abortion: z.coerce.number().min(0).max(20),
    numOfLivingChildren: z.coerce.number().min(0).max(20),
    lastDeliveryDate: z
      .preprocess(
        (arg) => (arg === "" ? null : arg), // Preprocess empty string to null
        z.union([
          z.literal(null), // Allows the value to be explicitly null
          z.coerce.date().refine((date) => date <= today, { message: "Cannot select a future date." }),
        ]),
      )
      .optional(),

    typeOfLastDelivery: z.string().optional(),

    lastMenstrualPeriod: z
      .preprocess(
        (arg) => (arg === "" ? null : arg),
        z.union([
          z.literal(null),
          z.coerce.date().refine((date) => date <= today, { message: "Cannot select a future date." }),
        ]),
      )
      .optional(),

    previousMenstrualPeriod: z
      .preprocess(
        (arg) => (arg === "" ? null : arg),
        z.union([
          z.literal(null),
          z.coerce.date().refine((date) => date <= today, { message: "Cannot select a future date." }),
        ]),
      )
      .optional(),
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
    // otherReferral: z.string().optional(),
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
    .number({ invalid_type_error: "Pulse rate must be a number" })
    .min(80, {
      message: "Pulse rate is too low. Please verify.",
    })
    .max(150, {
      message: "Pulse rate is too high. Please verify.",
    })
    .refine((val) => val >= 60 && val <= 140, {
      message:
        "A normal resting pulse rate is between 60-100 beats per minute. This reading is outside that range. Please verify.",
    }),
  bodyMeasurementRecordedAt: z.string().optional(),

  fp_physical_exam: z.object({
    skin_exam: z.string().optional(),
    conjunctiva_exam: z.string().optional(),
    neck_exam: z.string().optional(),
    breast_exam: z.string().optional(),
    abdomen_exam: z.string().optional(),
    extremities_exam: z.string().optional(),
  }),

  selectedIllnessIds: z.string().optional(),

  //   pelvicExamination: z.enum([
  //   "normal",
  //   "mass",
  //   "abnormal_discharge",
  //   "cervical_abnormalities",
  //   "warts",
  //   "polyp_or_cyst",
  //   "inflammation_or_erosion",
  //   "bloody_discharge",
  //   "not_applicable",
  // ]).optional(),

  fp_pelvic_exam: z.object({
    pelvicExamination: z.string().optional(),
    cervicalConsistency: z.string().optional(),
    cervicalTenderness: z.boolean().optional(),
    cervicalAdnexal: z.boolean().optional(),
    uterinePosition: z.string().optional(),
    uterineDepth: z.string().optional(),
  }),

  // cervicalConsistency: z.string().optional(),
  // cervicalTenderness: z.boolean().optional(),
  // cervicalAdnexal: z.boolean().optional(),
  // uterinePosition: z.string().optional(),
  // uterineDepth: z.string().optional(),

  acknowledgement: z.object({
    selectedMethod: z.string().nonempty("Please select a family planning method"),
    clientSignature: z.string().nonempty("Please sign and save the signature first"),
    clientSignatureDate: z
      .string()
      .nonempty("Client signature date is required")
      .refine(
        (dateString) => {
          const inputDate = new Date(dateString)
          inputDate.setHours(0, 0, 0, 0)
          return inputDate.getTime() === today.getTime()
        },
        {
          message: "Client signature date must be today's date",
        },
      ),
    clientName: z.string().nonempty("Client name is required"),
    guardianName: z.string().optional(),
    guardianSignature: z.string().optional(),
    guardianSignatureDate: z
      .string()
      .optional()
      .refine(
        (dateString) => {
          if (!dateString) return true // Optional field
          const inputDate = new Date(dateString)
          inputDate.setHours(0, 0, 0, 0)
          return inputDate.getTime() === today.getTime()
        },
        {
          message: "Guardian signature date must be today's date",
        },
      ),
    methodQuantity: z.coerce.number().optional(),
  }),
  serviceProvisionRecords: z.array(ServiceProvisionRecordSchema).optional().default([]),
  pregnancyCheck: PregnancyCheckSchema.optional(),
})

const page1BaseSchema = FamilyPlanningBaseSchema.pick({
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
  numOfLivingChildren: true,
  plan_more_children: true,
  avg_monthly_income: true,
  typeOfClient: true,
  subTypeOfClient: true,
  reasonForFP: true,
  otherReasonForFP: true,
  reason: true,
  methodCurrentlyUsed: true,
  otherMethod: true,
})

// Create different validation rules based on mode
export const createPage1Schema = (mode?: "create" | "edit" | "view" | "followup") =>
  page1BaseSchema.superRefine((data, ctx) => {
    // Skip validation for view mode
    if (mode === "view") return

    // For followup mode, only validate basic required fields, not reason fields
    if (mode === "followup") {
      if (!data.methodCurrentlyUsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Method currently used is required",
          path: ["methodCurrentlyUsed"],
        })
      }

      if (data.methodCurrentlyUsed === "Others" && !data.otherMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the other method",
          path: ["otherMethod"],
        })
      }
      return // Skip other validations for followup mode
    }

    // Enhanced validation for create/edit modes only
    if (data.typeOfClient === "newacceptor") {
      // New Acceptor validations
      if (!data.reasonForFP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reason for Family Planning is required",
          path: ["reasonForFP"],
        })
      }

      if (data.reasonForFP === "fp_others" && !data.otherReasonForFP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the other reason",
          path: ["otherReasonForFP"],
        })
      }

      // Method validation for new acceptors
      if (!data.methodCurrentlyUsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["methodCurrentlyUsed"],
        })
      }

    } else if (data.typeOfClient === "currentuser") {
      // Current User validations
      if (!data.subTypeOfClient) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["subTypeOfClient"],
        })
      }

      // Reason validation for current users (only for changing method)
      if (data.subTypeOfClient === "changingmethod" || data.subTypeOfClient === "changingclinic" || data.subTypeOfClient === "dropoutrestart") {
        if (!data.reasonForFP) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reason is required when changing method",
            path: ["reasonForFP"],
          })
        }

        // Specific reason validations
        if (data.reasonForFP === "sideeffects" && !data.reason) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please specify the side effects",
            path: ["reason"],
          })
        }

        if (data.reasonForFP === "fp_others" && !data.otherReasonForFP) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please specify the other reason",
            path: ["otherReasonForFP"],
          })
        }

        // Method validation for changing method
        if (!data.methodCurrentlyUsed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New method is required when changing method",
            path: ["methodCurrentlyUsed"],
          })
        }
      }
    }

    // Common validation for other method specification
    if (data.methodCurrentlyUsed === "Others" && !data.otherMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other method",
        path: ["otherMethod"],
      })
    }
  })


  
export const page2Schema = FamilyPlanningBaseSchema.pick({
  medicalHistory: true,
  obstetricalHistory: true,
}).superRefine((data, ctx) => {
  // Validate disability details
  if (data.medicalHistory?.disability && !data.medicalHistory.disabilityDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify disability details",
      path: ["medicalHistory", "disabilityDetails"],
    })
  }
})

export const page3Schema = FamilyPlanningBaseSchema.pick({
  sexuallyTransmittedInfections: true,
  violenceAgainstWomen: true,
}).superRefine((data, ctx) => {
  const { unpleasantRelationship, partnerDisapproval, domesticViolence, referredTo } = data.violenceAgainstWomen || {}

  const hasVawRisk = unpleasantRelationship || partnerDisapproval || domesticViolence

  if (hasVawRisk) {
    if (!referredTo || referredTo.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Referral is required when there are risks for Violence Against Women. Put N/A if unsure",
        path: ["violenceAgainstWomen", "referredTo"],
      })
      return // Stop further validation if referredTo is empty
    }

    if (referredTo === "Others" || (referredTo && !["DSWD", "WCPU", "NGOs"].includes(referredTo))) {
      // This means it's either "Others" as a placeholder or a custom input
      if (referredTo === "Others") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "",
          path: ["violenceAgainstWomen", "referredTo"],
        })
      }
    }
  }
})


export const page4Schema = FamilyPlanningBaseSchema.pick({
  weight: true,
  height: true,
  bloodPressure: true,
  pulseRate: true,
  skinExamination: true,
  bodyMeasurementRecordedAt: true,
})

export const page5Schema = FamilyPlanningBaseSchema.pick({
  acknowledgement: true,
})

export const page6Schema = FamilyPlanningBaseSchema.pick({
  serviceProvisionRecords: true,
}).extend({
  pregnancyCheck: PregnancyCheckSchema.optional(),
})

export const FamilyPlanningSchema = FamilyPlanningBaseSchema.superRefine((data, ctx) => {
  if (data.age < 18) {
    if (!data.acknowledgement?.guardianName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian name is required for clients under 18",
        path: ["acknowledgement", "guardianName"],
      })
    }
    if (!data.acknowledgement?.guardianSignature) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian signature is required for clients under 18",
        path: ["acknowledgement", "guardianSignature"],
      })
    }
    if (!data.acknowledgement?.guardianSignatureDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guardian signature date is required for clients under 18",
        path: ["acknowledgement", "guardianSignatureDate"],
      })
    }
  }

  if (data.medicalHistory?.disability && !data.medicalHistory.disabilityDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify disability details",
      path: ["medicalHistory", "disabilityDetails"],
    })
  }

  if (data.typeOfClient === "newacceptor") {
    if (!data.methodCurrentlyUsed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Method currently used is required for new acceptors",
        path: ["methodCurrentlyUsed"],
      })
    }
  } else if (data.typeOfClient === "currentuser") {
    if (data.subTypeOfClient === "changingmethod") {
      if (!data.methodCurrentlyUsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Method currently used is required for changing method",
          path: ["methodCurrentlyUsed"],
        })
      }
      if (data.reason === "Side Effects" && !data.reasonForFP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the side effects",
          path: ["fpt_other_reason_fp"],
        })
      }
    } else if (data.subTypeOfClient === "changingclinic" || data.subTypeOfClient === "dropoutrestart") {
      if (data.reasonForFP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reason for FP is not applicable for this sub-type",
          path: ["reasonForFP"],
        })
      }
      if (data.otherReasonForFP) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Other reason for FP is not applicable for this sub-type",
          path: ["otherReasonForFP"],
        })
      }
      if (data.methodCurrentlyUsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Method currently used is not applicable for this sub-type",
          path: ["methodCurrentlyUsed"],
        })
      }
      if (data.otherMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Other method is not applicable for this sub-type",
          path: ["otherMethod"],
        })
      }
    }
  }
})

export type FormData = z.infer<typeof FamilyPlanningSchema>
export type ServiceProvisionRecord = z.infer<typeof ServiceProvisionRecordSchema>
export type PregnancyCheck = z.infer<typeof PregnancyCheckSchema>

export default FamilyPlanningSchema
