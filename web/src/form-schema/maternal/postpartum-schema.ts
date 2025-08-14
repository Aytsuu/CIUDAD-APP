import { z } from "zod";

export const PostPartumSchema = z.object({
    pregnancy_id: z.string().optional(),
    mothersPersonalInfo: z.object({
        familyNo: z.string().optional(),
        motherLName: z.string().min(1, 'Last name is required'),
        motherFName: z.string().min(1, 'First name is required'),
        motherMName: z.string().optional(),
        motherAge: z.string().min(0, 'Age must be a positive number'),
        husbandLName: z.string().optional(),
        husbandFName: z.string().optional(),
        husbandMName: z.string().optional(),
        husbandDob: z.string().optional(),
        address: z.object({
            street: z.string().optional(),
            sitio: z.string().optional(),
            barangay: z.string().optional(),
            city: z.string().optional(),
            province: z.string().optional(),
        }),
    }),

    postpartumInfo: z.object({
        dateOfDelivery: z.string().date(),
        timeOfDelivery: z.string(),
        placeOfDelivery: z.string(),
        attendedBy: z.string().optional(),
        outcome: z.string(),
        ttStatus: z.string(),
        ironSupplement: z.string().date().optional(),
        lochialDischarges: z.string(),
        vitASupplement: z.string().date().optional(),
        noOfPadPerDay: z.number(),
        mebendazole: z.string().date().optional(),
        dateBfInitiated: z.string().date().optional(),
        timeBfInitiated: z.string().optional(),
        nextVisitDate: z.string().date().optional(),
    }),

    postpartumTable: z.object({
        date: z.string().date(),
        bp: z.object({
            systolic: z.string(),
            diastolic: z.string(),
        }),
        feeding: z.string(),
        findings: z.string(),
        nursesNotes: z.string(),
    })

})