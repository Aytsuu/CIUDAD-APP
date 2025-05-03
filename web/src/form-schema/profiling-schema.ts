import * as z from "zod";

export const demographicInfoSchema = z.object({
  id: z.string(), // For residents living independently
  building: z.string().min(1, "Building is required"),
  householdNo: z.string(),
  indigenous: z.string().min(1, "Indigenous is required"),
});

export const personalInfoSchema = z.object({

  per_id: z.string(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_dob: z.string().min(1, "Date of Birth is required"),
  per_status: z.string().min(1, "Status is required"),
  per_religion: z.string().min(1, "Religion is required"),
  
  per_lname: z.string()
    .min(1, "Last Name is required")
    .min(2, "Last Name must be at least 2 letters"),

  per_fname: z.string()
    .min(1, "First Name is required")
    .min(2, "First Name must be at least 2 letters"),

  per_mname: z.string()
    .refine((val) => val === "" || val.length >= 2, "Middle Name must be at least 2 letters")
    .optional(),

  per_address: z.string()
    .min(1, 'Address is required')
    .min(2, 'Must be atleast 2 letters'),

  per_edAttainment: z.string()
    .refine((val) => val === "" || val.length >= 2, {
      message: "Educational Attainment must be at least 2 letters",
    })
    .optional(),

  per_contact: z.string()
    .min(1, "Contact is required")
    .regex(
      /^09\d{9}$/,
      "Must be a valid mobile number (e.g., 09171234567)"
    )
    .refine((val) => val.length === 11, {
      message: "Must be 11 digits (e.g., 09171234567)",
    }),
});

export const parentInfoSchema = z.object({
  // To be removed, use personal
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
});

export const dependentSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
});

export const familyFormSchema = z.object({
  demographicInfo: demographicInfoSchema,
  motherInfo: parentInfoSchema,
  fatherInfo: parentInfoSchema,
  guardInfo: parentInfoSchema,
  dependentsInfo: z.object({
    list: z.array(dependentSchema).default([]),
    new: dependentSchema,
  }),
});

export const householdFormSchema = z.object({
  nhts: z.string().min(1, "NHTS household is required"),
  sitio: z.string().min(1, "Sitio is required"),
  street: z.string()
    .min(1, "Address is required")
    .min(2, "Address must be atleast 2 letters"),
  householdHead: z.string()
});

export const businessFormSchema = z.object({
  bus_respondentLname: z.string()
    .min(1, 'Last Name is required')
    .min(2, 'Last Name must be atleast 2 letters'),
  bus_respondentFname: z.string()
    .min(1, 'First Name is required')
    .min(2, 'First Name must be atleast 2 letters'),
  bus_respondentMname: z.string()
    .refine((val) => val === "" || val.length >= 0, 'Middle Name must be atleast 2 letters')
    .optional(),
  bus_respondentSex: z.string().min(1, 'Sex is required'),
  bus_respondentDob: z.string().min(1, 'Date of Birth is required'),
  bus_name: z.string().min(1, 'Business Name is required'),
  bus_gross_sales: z.string().min(1, 'Gross Sales is required'),
  bus_street: z.string().min(1, 'Street Address is required'),
  sitio: z.string().min(1, 'Sitio is required')
});

export const newMemberFormSchema = z.object({
  id: z.string(),
  role: z.string().min(1, "Role is required")
})
