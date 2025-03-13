import * as z from "zod";

export const dependentSchema = z.object({
    lastName: z.string(),
    firstName: z.string(),
    middleName: z.string(),
    suffix: z.string(),
    dateOfBirth: z.string(),
    sex: z.string(),
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
        streetAddress: z.string().min(1, 'Address is required'),
        religion: z.string().min(1, "Religion is required"),
        contact: z.string().min(1, "Contact is required"),
    }),

    motherInfo: z.object({
        lastName: z.string(),
        firstName: z.string(),
        middleName: z.string(),
        suffix: z.string(),
        dateOfBirth: z.string().date(),  
        status: z.string(),
        religion: z.string(),
        edAttainment: z.string(),
        contact: z.string(),
        philhealth: z.string(),
        vacStatus: z.string(),
        bloodType: z.string()
    }),
    fatherInfo: z.object({
        lastName: z.string(),
        firstName: z.string(),
        middleName: z.string(),
        suffix: z.string(),
        dateOfBirth: z.string().date(),  
        status: z.string(),
        religion: z.string(),
        edAttainment: z.string(),
        contact: z.string(),
        philhealth: z.string(),
        vacStatus: z.string(),
        bloodType: z.string()
    }),

    dependentsInfo: z.object({
        list: z.array(dependentSchema).default([]),
        new: dependentSchema
    }),

    assignPosition: z.string().min(1, 'Assign a Position')
})

