import * as z from "zod";

export const dependentSchema = z.object({
    dependentFName: z.string(),
    dependentLName: z.string(),
    dependentMName: z.string(),
    dependentSuffix: z.string(),
    dependentDateOfBirth: z.string(),
    dependentSex: z.string(),
})

export const profilingFormSchema = z.object({
    demographicInfo: z.object({
        building: z.string().min(1, "Building is required"),
        householdNo: z.string(),
        familyNo: z.string(),
        nhts: z.string().min(1, 'NHTS Household is required'),
        indigenous: z.string().min(1, 'Indigenous is required'),
        sitio: z.string().min(1, 'Sitio is required'),
    }),

    personalInfo: z.object({
        lastName: z.string().min(1, "Last Name is required"),
        firstName: z.string().min(1, "First Name is required"),
        middleName: z.string().optional(),
        suffix: z.string().optional(),
        sex: z.string().min(1, "Sex is required"),
        dateOfBirth: z.string().date(),
        status: z.string().min(1, "Status is required"),
        completeAddress: z.string().min(1, 'Address is required'),
        citizenship: z.string().min(1, "Citizenship is required"),
        religion: z.string().min(1, "Religion is required"),
        contact: z.string().min(1, "Contact is required"),
    }),

    motherInfo: z.object({
        motherLName: z.string(),
        motherFName: z.string(),
        motherMName: z.string(),
        motherSuffix: z.string(),
        motherDateOfBirth: z.string().date(),  
        motherStatus: z.string(),
        motherReligion: z.string(),
        motherEdAttainment: z.string(),
        motherPhilhealth: z.string(),
        motherVacStatus: z.string(),
        motherBloodType: z.string()
    }),
    fatherInfo: z.object({
        fatherLName: z.string(),
        fatherFName: z.string(),
        fatherMName: z.string(),
        fatherSuffix: z.string(),
        fatherDateOfBirth: z.string().date(),  
        fatherStatus: z.string(),
        fatherReligion: z.string(),
        fatherEdAttainment: z.string(),
    }),

    dependentsInfo: z.object({
        list: z.array(dependentSchema).default([]),
        new: dependentSchema
    })
})

