import z from "zod"

export const MotherBasicInfo = z.object({
    familyNo: z.string().min(1, 'Family No. is required'),
    isTransient: z.string().default('Resident'),
    motherLName: z.string().min(1, 'Last name is required'),
    motherFName: z.string().min(1, 'First name is required'),
    motherMName: z.string().min(1, 'Middle name is required'),
    motherAge: z.number().min(0, 'Age must be a positive number'),
    motherDOB: z.string().min(1, 'Date of birth is required'),
    husbandLName: z.string().min(1, "Husband's last name is required"),
    husbandFName: z.string().min(1, "Husband's first name is required"),
    husbandMName: z.string().min(1, "Husband's middle name is required"),
    occupation: z.string().min(1, 'Occupation is required'),
    address: z.string().min(1, 'Address is required'),
    motherWt: z.number().min(0, 'Weight must be a positive number'),
    motherHt: z.number().min(0, 'Height must be a positive number'),
    motherBMI: z.number().min(0, 'BMI must be a positive number'),
})

export const ObstreticHistory = z.object({
    noOfChBornAlive: z.number().optional(),
    noOfLivingCh: z.number().optional(),
    noOfAbortion: z.number().optional(),
    noOfStillBirths: z.number().optional(),
    typeOfLastDel: z.string().optional(),
    historyOfLBabies: z.number().optional(),
    historyOfDiabetes: z.string().optional()
})

export const MedicalHistory = z.object({
    prevIllness: z.string().optional(),
    prevIllnessYear: z.number().optional(),
    prevHospitalization: z.string().optional(),
    prevHospitalizationYear: z.number().optional()
})

export const PreviousPregnancy = z.object({
    dateOfDelivery: z.string().optional(),
    outcome: z.string().optional(),
    typeOfDelivery: z.string().optional(),
    babysWt: z.number().optional(),
    gender: z.string().optional(),
    ballardScore: z.number().optional(),
    apgarScore: z.number().optional()
})