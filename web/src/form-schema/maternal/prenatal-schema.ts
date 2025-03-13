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
        prevIllnessYear: z.number().optional(),
        prevHospitalization: z.string().optional(),
        prevHospitalizationYear: z.number().optional()
    }),

    // previous pregnancy
    previousPregnancy: z.object({
        dateOfDelivery: z.string().optional(),
        outcome: z.string().optional(),
        typeOfDelivery: z.string().optional(),
        babysWt: z.number().optional(),
        gender: z.string().optional(),
        ballardScore: z.number().optional(),
        apgarScore: z.number().optional()
    }),

        // pregnant tetanus vaccine
    tetanusToxoid: z.object({
        ttStatus: z.string().min(1, 'TT Status is required'),
        ttDateGiven: z.string().min(1, 'Date given is required')
    }),

    // present pregnancy
    presentPregnancy: z.object({
        gravida: z.number().default(1),
        para: z.number().default(0),
        fullterm: z.number().default(0),
        preterm: z.number().default(0),
        lmp: z.string().min(1, 'LMP is required'),
        edc: z.string().min(1, 'EDC is required')
    }),

    // laboratory results
    labResults: z.object({
        urinalyisDate: z.string().optional(),
        cbcDate: z.string().optional(),
        sgotSgptDate: z.string().optional(),
        creatinineDate: z.string().optional(),
        buaBunDate: z.string().optional(),
        syphillisDate: z.string().optional(),
        hivTestDate: z.string().optional(),
        hepaBDate: z.string().optional(),
        bloodTypingDate: z.string().optional(),
        ogct50Date: z.string().optional(),
        ogct100Date: z.string().optional()
    }),

        // follow-up schedule
    followUpSchedule: z.object({
        dateOfFollowUp: z.string().min(1, 'Date is required')
    }),

    // checklist
    checklist: z.array(
        z.object({
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
        })
    ),

    pregnancyPlan: z.object({
        planPlacePfDel: z.string().optional(),
        planNewbornScreening: z.boolean()
    }),

    micronutrientSupp: z.object({
        ironFolicStarted: z.string().optional(),
        ironFolicCompleted: z.string().optional(),
        deworming: z.string().optional()
    }),

    riskCodes: z.array(
        z.object({
            prevCaesarian: z.boolean(),
            miscarriages: z.boolean(),
            postpartumHemorrhage: z.boolean(),
            tuberculosis: z.boolean(),
            heartDisease: z.boolean(),
            diabetes: z.boolean(),
            bronchialAsthma: z.boolean(),
            goiter: z.boolean()
        })
    ),

    assessedBy: z.object({
        assessedby: z.string().min(1, "Assessed by is required")
    })
})

    
// export type FormData = z.infer<typeof PrenatalFormSchema>;