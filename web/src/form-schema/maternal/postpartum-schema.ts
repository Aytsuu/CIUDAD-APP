import { z } from "zod";

export const PostPartumSchema = z.object({
    mothersPersonalInfo: z.object({
        familyNo: z.string().min(1, 'Family No. is required'),
        isTransient: z.string().default('Resident'),
        motherLName: z.string().min(1, 'Last name is required'),
        motherFName: z.string().min(1, 'First name is required'),
        motherMName: z.string().optional(),
        motherAge: z.string().min(0, 'Age must be a positive number'),
        husbandLName: z.string().optional(),
        husbandFName: z.string().optional(),
        husbandMName: z.string().optional(),
        address: z.object({
            street: z.string().min(1, 'Street is required'),
            sitio: z.string().min(1, 'Sitio is required'),
            barangay: z.string().min(1, 'Barangay is required'),
            city: z.string().min(1, 'City is required'),
            province: z.string().min(1, 'Province is required'),
        }),
    }),

    postpartumInfo: z.object({
        dateOfDelivery: z.string().date(),
        timeOfDelivery: z.string().optional(),
        placeOfDelivery: z.string(),
        attendedBy: z.string().optional(),
        outcome: z.string(),
        ttStatus: z.string(),
        ironSupplement: z.string().date(),
        lochialDischarges: z.string(),
        vitASupplement: z.string().date(),
        noOfPadPerDay: z.string(),
        mebendazole: z.string().date().optional(),
        dateBfInitiated: z.string().date(),
        timeBfInitiated: z.string(),
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