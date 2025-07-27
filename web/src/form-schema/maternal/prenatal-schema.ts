import z from "zod"

// positive number schema
export const positiveNumberSchema = z
  .union([
    z.string(),  // input as string
    z.number(),  //  number input
    z.null(),    // db null values
    z.undefined(), // undefined values
  ])
  .transform((val, ctx) => {
    // handle null, undefined, or empty string - all become undefined
    if (val === null || val === undefined || val === "") {
      return undefined
    }
    
    // If it's already a number, validate it
    if (typeof val === "number") {
      if (val < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Value must be a positive number"
        })
        return z.NEVER
      }
      if (isNaN(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid number",
        });
        return z.NEVER;
      }
      return val
    }
    
    // Handle string input
    if (typeof val === "string") {
      // Empty string becomes undefined
      if (val.trim() === "") {
        return undefined
      }
      
      // Try to parse as number
      const num = Number.parseFloat(val)
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid number"
        })
        return z.NEVER
      }
      
      if (num < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Value must be a positive number"
        })
        return z.NEVER
      }
      
      return num
    }
    
    // If we get here, it's an unexpected type
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid input type"
    })
    return z.NEVER
  })

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD.");

export const optionalDateSchema = z.preprocess(
  (val) => (val === "" ? undefined : val), // Convert empty string to undefined
  dateSchema.optional(), // Apply base date schema, then make optional
)

export const PrenatalCareEntrySchema = z.object({
  date: dateSchema,
  aog: z.object({
    aogWeeks: positiveNumberSchema, 
    aogDays: positiveNumberSchema, // Keep as string for form input, transform later if needed
  }),
  wt: positiveNumberSchema, // Keep as string for form input, transform later if needed
  bp: z.object({
    systolic: positiveNumberSchema, // Keep as string for form input, transform later if needed
    diastolic: positiveNumberSchema, // Keep as string for form input, transform later if needed
  }),
  leopoldsFindings: z.object({
    fundalHeight: z.string().optional(),
    fetalHeartRate: z.string().optional(),
    fetalPosition: z.string().optional(),
  }),
  notes: z.object({
    complaints: z.string().optional(),
    advises: z.string().optional(),
  }),
})

// mother's basic info
export const PrenatalFormSchema = z.object({
    pat_id: z.string().optional(),
    motherPersonalInfo: z.object({
        familyNo: z.string().optional(),
        motherLName: z.string().min(1, 'Last name is required'),
        motherFName: z.string().min(1, 'First name is required'),
        motherMName: z.string().optional().default(''),
        motherAge: positiveNumberSchema.refine((val) => val !== undefined && val >= 1, { message: "Value must be at least 1" }),
        motherDOB: dateSchema,
        husbandLName: z.string().optional(),
        husbandFName: z.string().optional(),
        husbandMName: z.string().optional(),
        husbandDob: z.string().optional(),
        occupation: z.string().default(''),
        address: z.object({
            street: z.string().min(1, 'Street is required'),
            sitio: z.string().min(1, 'Sitio is required'),
            barangay: z.string().min(1, 'Barangay is required'),
            city: z.string().min(1, 'City is required'),
            province: z.string().min(1, 'Province is required'),
        }).optional(),
        motherWt: positiveNumberSchema.refine(val => val !== undefined && val >= 1, { message: "Value must be at least 1" }),
        motherHt: positiveNumberSchema.refine(val => val !== undefined && val >= 1, { message: "Value must be at least 1" }),
        motherBMI: positiveNumberSchema.refine(val => val !== undefined && val >= 1, { message: "Value must be at least 1" }),
        motherBMICategory: z.string()
    }),

    // obstetric history
    obstetricHistory: z.object({
        noOfChBornAlive: positiveNumberSchema.optional(),
        noOfLivingCh: positiveNumberSchema.optional(),
        noOfAbortion: positiveNumberSchema.optional(),
        noOfStillBirths: positiveNumberSchema.optional(),
        historyOfLBabies: positiveNumberSchema.optional(),
        historyOfDiabetes: z.string().optional(),
    }).optional(),

    // medical history
    medicalHistory: z.object({
        prevIllness: z.string().default(''),
        prevIllnessYr: positiveNumberSchema.optional(),
        prevHospitalization: z.string().optional(),
        prevHospitalizationYr: positiveNumberSchema.optional(),

        prevIllnessData: z.array(z.object({
            prevIllness: z.string().default(''),
            prevIllnessYr: positiveNumberSchema.optional(),
        })).optional(),
        prevHospitalizationData: z.array(z.object({
            prevHospitalization: z.string().default(''),
            prevHospitalizationYr: positiveNumberSchema.optional(),
        })).optional(),
    }),

    // previous pregnancy
    previousPregnancy: z.object({
        dateOfDelivery: dateSchema.optional(),
        outcome: z.string().optional(),
        typeOfDelivery: z.string().optional(),
        babysWt: positiveNumberSchema.default(0),
        gender: z.string().optional(),
        ballardScore: positiveNumberSchema.default(0).optional(),
        apgarScore: positiveNumberSchema.default(0).optional()
    }),

    // pregnant vaccine info
    prenatalVaccineInfo: z.object({
        vaccineType: z.string().optional(),
        ttStatus: z.string().optional(),
        ttDateGiven: z.string().optional(),
        fullyImmunized: z.boolean().optional(),
        isTDAPAdministered: z.string().optional()
    }),

    // present pregnancy
    presentPregnancy: z.object({
        gravida: positiveNumberSchema.optional(),
        para: positiveNumberSchema.optional(),
        fullterm: positiveNumberSchema.optional(),
        preterm: positiveNumberSchema.optional(),
        pf_lmp: dateSchema.optional(),
        pf_edc: dateSchema.optional(),
    }),

  
    labResults: z.object({
      // Current input fields
      lab_type: z
        .enum([
          "urinalysis",
          "cbc",
          "sgot_sgpt",
          "creatinine_serum",
          "bua_bun",
          "syphilis",
          "hiv_test",
          "hepa_b",
          "blood_typing",
          "ogct_50gms",
          "ogct_100gms",
        ])
        .optional(),
      resultDate: dateSchema.optional(),
      toBeFollowed: z.boolean().optional(),
      documentPath: z.string().optional(),
      labRemarks: z.string().optional(),
      // Array to store accumulated lab results
      labResultsData: z
        .array(
          z.object({
            lab_type: z.enum([
              "urinalysis",
              "cbc",
              "sgot_sgpt",
              "creatinine_serum",
              "bua_bun",
              "syphilis",
              "hiv_test",
              "hepa_b",
              "blood_typing",
              "ogct_50gms",
              "ogct_100gms",
            ]),
            resultDate: optionalDateSchema.optional(),
            toBeFollowed: z.boolean().optional(),
            documentPath: z.string().optional(),
            labRemarks: z.string().optional(),
            images: z
              .array(
                z.object({
                  image_url: z.string(),
                  image_name: z.string(),
                  image_type: z.string(),
                  image_size: z.number(),
                }),
              ).optional(),
          }),
        )
        .optional(),
    })
    .optional(),

    // follow-up schedule
    followUpSchedule: z.object({
        followUpDate: dateSchema.optional(),
        aogWeeks: positiveNumberSchema.optional(),
        aogDays: positiveNumberSchema.optional(),
    }),

    // guide for 4anc visits
    ancVisits: z.object({
        firstTri: dateSchema.optional(),
        secondTri: dateSchema.optional(),
        thirdTriOne: dateSchema.optional(),
        thirdTriTwo: dateSchema.optional()
    }),

    // checklist
    assessmentChecklist: z.object({
        increasedBP: z.boolean().optional(),
        epigastricPain: z.boolean().optional(),
        nausea: z.boolean().optional(),
        blurringOfVision: z.boolean().optional(),
        edema: z.boolean().optional(),
        severeHeadache: z.boolean().optional(),
        abnormalVaginalDischarges: z.boolean().optional(),
        vaginalBleeding: z.boolean().optional(),
        chillsFever: z.boolean().optional(),
        diffInBreathing: z.boolean().optional(),
        varicosities: z.boolean().optional(),
        abdominalPain: z.boolean().optional()
    }),

    // pregnancy plan
    pregnancyPlan: z.object({
        planPlaceOfDel: z.string().optional().default(''),
        planNewbornScreening: z.boolean().optional().default(false)
    }),

    // micronutrient supplementation
    // micronutrientSupp: z.object({
    //     ironFolicStarted: z.string().optional(),
    //     ironFolicCompleted: z.string().optional(),
    //     deworming: z.string().optional()
    // }),

    // risk codes
    riskCodes: z.object({
        hasOneOrMoreOfTheFF: z.object({
            prevCaesarian: z.boolean().optional(),
            miscarriages: z.boolean().optional(),
            postpartumHemorrhage: z.boolean().optional(),
        }),
        hasOneOrMoreOneConditions: z.object({
            tuberculosis: z.boolean().optional(),
            heartDisease: z.boolean().optional(),
            diabetes: z.boolean().optional(),
            bronchialAsthma: z.boolean().optional(),
            goiter: z.boolean().optional()
        })
    }),

    // assessed by
    assessedBy: z.object({
        assessedby: z.string().optional()
    }),

    // prenatal care table
    prenatalCare: z.array(PrenatalCareEntrySchema).optional(),
})