import z from "zod"

// mother's basic info
export const PrenatalFormSchema = z.object({
    motherPersonalInfo: z.object({
        familyNo: z.string().min(1, 'Family No. is required'),
        isTransient: z.string().default('Resident'),
        motherLName: z.string().min(1, 'Last name is required'),
        motherFName: z.string().min(1, 'First name is required'),
        motherMName: z.string().optional(),
        motherAge: z.number().min(0, 'Age must be a positive number'),
        motherDOB: z.string().date(),
        husbandLName: z.string().optional(),
        husbandFName: z.string().optional(),
        husbandMName: z.string().optional(),
        occupation: z.string().min(1, 'Occupation is required'),
        address: z.array(
            z.object({
                street: z.string().min(1, 'Street is required'),
                barangay: z.string().min(1, 'Barangay is required'),
                city: z.string().min(1, 'City is required'),
                province: z.string().min(1, 'Province is required'),
            })  
        ),
        motherWt: z.number().min(0, 'Weight must be a positive number'),
        motherHt: z.number().min(0, 'Height must be a positive number'),
        motherBMI: z.number().min(0, 'BMI must be a positive number'),
    }),

    // obstretic history
    obstreticHistory: z.object({
        noOfChBornAlive: z.number().optional(),
        noOfLivingCh: z.number().optional(),
        noOfAbortion: z.number().optional(),
        noOfStillBirths: z.number().optional(),
        historyOfLBabies: z.number().optional(),
        historyOfDiabetes: z.string().optional()
    }),

    // medical history
    medicalHistory: z.object({
        prevIllness: z.string().optional(),
        prevHospitalization: z.string().optional(),
    }),

    // previous pregnancy
    previousPregnancy: z.object({
        dateOfDelivery: z.string().date().optional(),
        outcome: z.string().optional(),
        typeOfDelivery: z.string().optional(),
        babysWt: z.number().optional(),
        gender: z.string().optional(),
        ballardScore: z.number().optional(),
        apgarScore: z.number().optional()
    }),

        // pregnant tetanus vaccine
    tetanusToxoid: z.object({
        ttStatus: z.string(),
        ttDateGiven: z.string()
    }),

    // present pregnancy
    presentPregnancy: z.object({
        gravida: z.number().default(1),
        para: z.number().default(0),
        fullterm: z.number().default(0),
        preterm: z.number().default(0),
        lmp: z.string().date(),
        edc: z.string().date(),
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
        ogct100Date: z.string().date().optional()
    }),

    // follow-up schedule
    followUpSchedule: z.object({
        scheduleOption: z.enum(['week', 'twoweeks', 'month']),
        dateOfFollowUp: z.string().date()
    }),

    // guide for 4anc visits
    ancVisits: z.object({
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
            aogWeeks: z.number(),
            aogDays: z.number(),
        }),
        wt: z.number(),
        bp: z.object({
            systolic: z.number(),
            diastolic: z.number(),
        }),
        leopoldsFindings: z.string(),
        notes: z.object({
            complaints: z.string().optional(),
            advises: z.string().optional(),
        })
    })
})
