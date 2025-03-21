import * as z from "zod";
import api from "@/api/api";

// Fetch household numbers from the API
const fetchHouseholdNumbers = async (): Promise<string[]> => {
    try {
        const res = await api.get('profiling/household/');
        return res.data.map((household: any) => household.hh_id);
    } catch (err) {
        console.error("Failed to fetch household numbers:", err);
        return [];
    }
};

// Custom validation function to check if householdNo exists in the database
const validateHouseholdNo = async (householdNo: string): Promise<boolean> => {
    const householdNumbers = await fetchHouseholdNumbers();
    return householdNumbers.includes(householdNo);
};

// Define the schema with custom validation for householdNo
export const demographicInfo = z.object({
    id: z.string(), // For residents living independently
    building: z.string().min(1, 'Building is required'),
    householdNo: z.string().min(1, "Household number is required").refine(async (householdNo) => {
        return await validateHouseholdNo(householdNo);
    }, {
        message: "Household number does not exist",
    }),
    indigenous: z.string().min(1, 'Indigenous is required'),
});

export const personalInfoSchema = z.object({
    per_id: z.string(),
    per_lname: z.string().min(1, "Last Name is required"),
    per_fname: z.string().min(1, "First Name is required"),
    per_mname: z.string(),
    per_suffix: z.string().optional(),
    per_sex: z.string().min(1, "Sex is required"),
    per_dob: z.string().date(),
    per_status: z.string().min(1, "Status is required"),
    per_address: z.string().min(1, 'Address is required'),
    per_edAttainment: z.string(),
    per_religion: z.string().min(1, "Religion is required"),
    per_contact: z.string().min(1, "Contact is required"),
})                                                                                                                                                                                                                                       
export const motherInfo = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    middleName: z.string(),
    suffix: z.string(),
    dateOfBirth: z.string().date(),  
    status: z.string(),
    religion: z.string(),
    edAttainment: z.string(),
    contact: z.string(),
})

export const fatherInfo = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    middleName: z.string(),
    suffix: z.string(),
    dateOfBirth: z.string().date(),  
    status: z.string(),
    religion: z.string(),
    edAttainment: z.string(),
    contact: z.string(),
})

export const dependentSchema = z.object({
    id: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    middleName: z.string(),
    suffix: z.string(),
    dateOfBirth: z.string(),
    sex: z.string(),
})


export const familyFormSchema = z.object({
    demographicInfo: demographicInfo,
    motherInfo: motherInfo,
    fatherInfo: fatherInfo,
    dependentsInfo: z.object({
        list: z.array(dependentSchema).default([]),
        new: dependentSchema
    }),
})

export const householdSchema = z.object({
    nhts: z.string().min(1),
    sitio: z.string().min(1),
    street: z.string().min(1),
    householdHead: z.string().min(1)
})
