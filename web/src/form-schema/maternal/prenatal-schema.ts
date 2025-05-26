import z from "zod"

// positive number schema
export const positiveNumberSchema = z.union([
  z.string()
    .min(1, "Value is required")
    .transform(val => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error("Invalid number");
      return num;
    }),
  z.number()
]).refine(val => val >= 0, {
  message: "Value must be a positive number"
});

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD.");

// mother's basic info
export const PrenatalFormSchema = z.object({
    motherPersonalInfo: z.object({
        familyNo: z.string().min(1, 'Family No. is required'),
        isTransient: z.string().default('Resident'),
        motherLName: z.string().min(1, 'Last name is required'),
        motherFName: z.string().min(1, 'First name is required'),
        motherMName: z.string().optional(),
        motherAge: positiveNumberSchema.refine(val => val >= 1, { message: "Value must be at least 1" }),
        motherDOB: dateSchema,
        husbandLName: z.string().optional(),
        husbandFName: z.string().optional(),
        husbandMName: z.string().optional(),
        occupation: z.string().min(1, 'Occupation is required'),
        address: z.object({
            street: z.string().min(1, 'Street is required'),
            barangay: z.string().min(1, 'Barangay is required'),
            city: z.string().min(1, 'City is required'),
            province: z.string().min(1, 'Province is required'),
        }),
        motherWt: positiveNumberSchema.refine(val => val >= 1, { message: "Value must be at least 1" }),
        motherHt: positiveNumberSchema.refine(val => val >= 1, { message: "Value must be at least 1" }),
        motherBMI: positiveNumberSchema.refine(val => val >= 1, { message: "Value must be at least 1" }),
    }),

    // obstretic history
    obstreticHistory: z.object({
        noOfChBornAlive: positiveNumberSchema.optional(),
        noOfLivingCh: positiveNumberSchema.optional(),
        noOfAbortion: positiveNumberSchema.optional(),
        noOfStillBirths: positiveNumberSchema.optional(),
        historyOfLBabies: positiveNumberSchema.optional(),
        historyOfDiabetes: z.string().optional(),
    }),

    // medical history
    medicalHistory: z.object({
        prevIllness: z.string().optional(),
        prevHospitalization: z.string().optional(),
        prevHospitalizationYr: positiveNumberSchema.optional(),
    }),

    // previous pregnancy
    previousPregnancy: z.object({
        dateOfDelivery: z.string().date().optional(),
        outcome: z.string().optional(),
        typeOfDelivery: z.string().optional(),
        babysWt: positiveNumberSchema.default(0),
        gender: z.string().optional(),
        ballardScore: positiveNumberSchema.default(0),
        apgarScore: positiveNumberSchema.default(0)
    }),

    // pregnant vaccine info
    prenatalVaccineInfo: z.object({
        ttOrtd: z.enum(['TT', 'TD']),
        isAdministered: z.enum(['Yes', 'No']),
        ttStatus: z.string(),
        ttDateGiven: z.string(),
        fullyImmunized: z.boolean(),
        tdapDateGiven: z.string().optional()
    }),

    // present pregnancy
    presentPregnancy: z.object({
        gravida: z.string(),
        para: z.string(),
        fullterm: z.string(),
        preterm: z.string(),
        lmp: dateSchema,
        edc: dateSchema,
    }),

    // laboratory results
    labResults: z.object({
        urinalysisDate: z.string().date().optional(),
        cbcDate: z.string().date().optional(),
        sgotSgptDate: z.string().date().optional(),
        creatinineDate: z.string().date().optional(),
        buaBunDate: z.string().date().optional(),
        syphillisDate: z.string().date().optional(),
        hivTestDate: z.string().date().optional(),
        hepaBDate: z.string().date().optional(),
        bloodTypingDate: z.string().date().optional(),
        ogct50Date: z.string().date().optional(),
        ogct100Date: z.string().date().optional(),
        laboratoryRemarks: z.string().optional(),
    }),

    // follow-up schedule
    followUpSchedule: z.object({
        scheduleOption: z.enum(['week', 'twoweeks', 'month', '']),
        dateOfFollowUp: z.string().date()
    }),

    // guide for 4anc visits
    ancVisits: z.object({
        aog: z.object({
            aogWeeks: z.string(),
            aogDays: z.string(),
        }),
        firstTri: z.string().date().optional(),
        secondTri: z.string().date().optional(),
        thirdTriOne: z.string().date().optional(),
        thirdTriTwo: z.string().date().optional()
    }),

    // checklist
    assessmentChecklist: z.object({
        increasedBP: z.boolean(),
        epigastricPain: z.boolean(),
        nausea: z.boolean(),
        blurringOfVision: z.boolean(),
        edema: z.boolean(),
        severeHeadache: z.boolean(),
        abnormalVaginalDischarges: z.boolean(),
        vaginalBleeding: z.boolean(),
        chillsFever: z.boolean(),
        diffInBreathing: z.boolean(),
        varicosities: z.boolean(),
        abdominalPain: z.boolean()
    }),

    // pregnancy plan
    pregnancyPlan: z.object({
        planPlaceOfDel: z.string().optional(),
        planNewbornScreening: z.boolean()
    }),

    // micronutrient supplementation
    micronutrientSupp: z.object({
        ironFolicStarted: z.string().optional(),
        ironFolicCompleted: z.string().optional(),
        deworming: z.string().optional()
    }),

    // risk codes
    riskCodes: z.object({
        hasOneOrMoreOfTheFF: z.object({
            prevCaesarian: z.boolean(),
            miscarriages: z.boolean(),
            postpartumHemorrhage: z.boolean(),
        }),
        hasOneOrMoreOneConditions: z.object({
            tuberculosis: z.boolean(),
            heartDisease: z.boolean(),
            diabetes: z.boolean(),
            bronchialAsthma: z.boolean(),
            goiter: z.boolean()
        })
    }),

    // assessed by
    assessedBy: z.object({
        assessedby: z.string().min(1, "Assessed by is required")
    }),

    // prenatal care table
    prenatalCare: z.object({
        date: z.string().date(),
        aog: z.object({
            aogWeeks: z.string(),
            aogDays: z.string(),
        }),
        wt: z.string(),
        bp: z.object({
            systolic: z.string(),
            diastolic: z.string(),
        }),
        leopoldsFindings: z.object({
            fundalHeight: z.string().optional(),
            fetalHeartRate: z.string().optional(),
            fetalPosition: z.string().optional(),
        }),
        notes: z.object({
            complaints: z.string().optional(),
            advises: z.string().optional(),
        })
    })
})
