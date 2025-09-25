import * as z from "zod";
import { accountFormSchema } from "./account-schema";


export const demographicInfoSchema = z.object({
  id: z.string().optional(), 
  building: z.string().min(1, "Building is required"),
  householdNo: z.string(),
  indigenous: z.string().min(1, "Indigenous is required"),
});

export const personalInfoSchema = z.object({
  per_id: z.string().optional(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_dob: z.string()
  .min(1, "Date of Birth is required")
  .refine((val) => {
    // Parse input date string (YYYY-MM-DD)
    const inputDate = new Date(val + "T00:00:00+08:00"); // Philippine timezone offset
    
    if (isNaN(inputDate.getTime())) return false;

    // Get current date in Philippine timezone
    const now = new Date();
    // convert now to Philippines date string
    const nowPhDateStr = now.toLocaleDateString("en-US", { timeZone: "Asia/Manila" });
    // convert back to Date to zero out time
    const nowPh = new Date(nowPhDateStr);

    // Check that inputDate is <= today in PH timezone
    return inputDate <= nowPh;
  }, {
    message: "Invalid Date of Birth",
  }),
  per_status: z.string().min(1, "Status is required"),
  per_religion: z.string().min(1, "Religion is required"),
  per_addresses: z.array(z.object({})).default([]),
  
  per_lname: z.string()
    .min(1, "Last Name is required")
    .min(2, "Last Name must be at least 2 letters"),

  per_fname: z.string()
    .min(1, "First Name is required")
    .min(2, "First Name must be at least 2 letters"),

  per_mname: z.string()
    .refine((val) => val === "" || val.length >= 2, "Middle Name must be at least 2 letters")
    .optional(),

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
  per_disability: z.string(),
});

export const perAddDetails = z.object({
  bloodType: z.string().optional(),
  philHealthId: z.string().optional(),
  covidVaxStatus: z.string().optional(),
});

export const motherHealthInfo = z.object({
  healthRiskClass: z.string().optional(),
  immunizationStatus: z.string().optional(),
  method: z.array(z.string()).optional(), 
  source: z.string().optional(),
});

const parentInfoSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  status: z.string(),
  religion: z.string(),
  edAttainment: z.string(),
  contact: z.string(),
  perAddDetails: perAddDetails.optional(),

});
 
export const dependentUnderFiveSchema = z.object({
    fic: z.string().optional(),
    nutritionalStatus: z.string().optional(),
    exclusiveBf: z.string().optional(),
});

export const dependentSchema = z.object({
  id: z.string().optional(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
  dependentUnderFiveSchema: dependentUnderFiveSchema.optional(),
});

export const householdHeadSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  sex: z.string(),
});
export const personInfoSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  sex: z.string(),
  dateOfBirth: z.string(),
  contact: z.string(),
});

export const environmentalFormSchema = z.object({
  waterSupply: z.string().min(1, "Water supply type is required"),
  facilityType: z.string().min(1, "Facility type is required"),
  sanitaryFacilityType: z.string().optional(),
  unsanitaryFacilityType: z.string().optional(),
  toiletFacilityType: z.string().min(1, "Toilet facility type is required"),
  wasteManagement: z.string().min(1, "Waste management type is required"),
  wasteManagementOthers: z.string().optional(), // For "others" option
});

// Base schemas for NCD and TB (optional by default)
export const ncdFormBaseSchema = z.object({
  riskClassAgeGroup: z.string().optional(),
  comorbidities: z.string().optional(),
  comorbiditiesOthers: z.string().optional(), // For "others" option
  lifestyleRisk: z.string().optional(),
  lifestyleRiskOthers: z.string().optional(), // For "others" option
  inMaintenance: z.string().optional(),
})

export const tbSurveilanceBaseSchema = z.object({
  srcAntiTBmeds: z.string().optional(),
  srcAntiTBmedsOthers: z.string().optional(), // For "others" option
  noOfDaysTakingMeds: z.string().optional(),
  tbStatus: z.string().optional(),
})

// Required schemas when resident is selected
export const ncdFormSchema = z.object({
  riskClassAgeGroup: z.string().min(1, "Risk class age group is required"),
  comorbidities: z.string().min(1, "Comorbidities is required"),
  comorbiditiesOthers: z.string().optional(), // For "others" option
  lifestyleRisk: z.string().min(1, "Lifestyle risk is required"),
  lifestyleRiskOthers: z.string().optional(), // For "others" option
  inMaintenance: z.string().min(1, "Maintenance status is required"),
})

export const tbSurveilanceSchema = z.object({
  srcAntiTBmeds: z.string().min(1, "Source of anti-TB medication is required"),
  srcAntiTBmedsOthers: z.string().optional(), // For "others" option
  noOfDaysTakingMeds: z.string().min(1, "Number of days taking medication is required"),
  tbStatus: z.string().min(1, "TB status is required"),
})


export const familyFormSchema = z.object({
  demographicInfo: demographicInfoSchema,
  householdHead: z.object({
    per_lname: z.string().optional(),
    per_fname: z.string().optional(),
    per_mname: z.string().optional(),
    per_sex: z.string().optional(),
  }),
  respondentInfo: parentInfoSchema,
  motherInfo: parentInfoSchema.extend({
      motherHealthInfo: motherHealthInfo.optional(),
  }),
  fatherInfo: parentInfoSchema,
  guardInfo: parentInfoSchema,
  dependentsInfo: z.object({
    list: z.array(dependentSchema).default([]),
    new: dependentSchema,
  }),
  environmentalForm: environmentalFormSchema,
  
  ncdRecords: z.object({
    list: z.array(personInfoSchema.extend({
      ncdFormSchema: ncdFormSchema.optional()
    })).default([]),
    new: personInfoSchema.extend({
      ncdFormSchema: ncdFormBaseSchema.optional()
    })
  }),
  tbRecords: z.object({
    list: z.array(personInfoSchema.extend({
      tbSurveilanceSchema: tbSurveilanceSchema.optional()
    })).default([]),
    new: personInfoSchema.extend({
      tbSurveilanceSchema: tbSurveilanceBaseSchema.optional()
    })
  }),
});

export const householdFormSchema = z.object({
  householdHead: z.string(),
  nhts: z.string().min(1, "NHTS household is required"),
  add_id: z.string(),
  address: z.string().min(1, "Address is required"),
});

export const businessFormSchema = z.object({
  rp_id: z.string().optional(),
  respondent: z.object({
    per_lname: z.string()
      .min(1, 'Last Name is required')
      .min(2, 'Last Name must be atleast 2 letters'),
    per_fname: z.string()
      .min(1, 'First Name is required')
      .min(2, 'First Name must be atleast 2 letters'),
    per_mname: z.string()
      .refine((val) => val === "" || val.length >= 0, 'Middle Name must be atleast 2 letters')
      .optional(),
    per_sex: z.string().min(1, 'Sex is required'),
    per_dob: z.string().min(1, 'Date of Birth is required'),
    per_contact: z.string()
      .min(1, "Contact is required")
      .regex(
        /^09\d{9}$/,
        "Must be a valid mobile number (e.g., 09171234567)"
      )
      .refine((val) => val.length === 11, {
        message: "Must be 11 digits (e.g., 09171234567)",
      }),
  }),
  bus_name: z.string().min(1, 'Business Name is required'),
  bus_gross_sales: z.string().min(1, 'Gross Sales is required'),
  bus_location: z.string().min(1, 'Business Address is required'),
});

export const newMemberFormSchema = z.object({
  familyId: z.string(),
  id: z.string(),
  role: z.string().min(1, "Role is required")
})
export const surveyFormSchema = z.object({
  filledBy: z.string().min(1, "Name is required"),
  informant: z.string().min(1, "Informant/Conforme name is required"),
  checkedBy: z.string().min(1, "Checker name is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  signature: z.string().min(1, "Signature is required"),
});

export const CompleteResidentProfilingSchema = z.object({
  personalSchema: personalInfoSchema,
  accountSchema: accountFormSchema,
  houseSchema: z.object({
    list: z.array(z.object({})).default([]),
    info: householdFormSchema
  }),
  livingSoloSchema: demographicInfoSchema,
  familySchema: z.object({
    familyId: z.string().min(1, "Family ID is required"),
    role: z.string().min(1, "Role is required")
  }),
  businessSchema: z.object({
    bus_name: z.string().min(1, 'Business Name is required'),
    bus_gross_sales: z.string().min(1, 'Gross Sales is required'),
    bus_location: z.string().min(1, 'Business Address is required'),
    files: z.array(z.object({})).default([])
  })
})