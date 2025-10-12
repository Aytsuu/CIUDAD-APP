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
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 letters"),

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

export const perAddDetails = z.object({
  bloodType: z.string().optional(),
  philHealthId: z.string().optional(),
  covidVaxStatus: z.string().optional(),
});

export const parentInfoSchema = z.object({
  // To be removed, use personal
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  sex: z.string(),
  dateOfBirth: z.string().date(),
  status: z.string(),
  religion: z.string(),
  edAttainment: z.string(),
  contact: z.string(),
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


export const dependentSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
});

export const householdHeadSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  sex: z.string(),
});

export const householdFormSchema = z.object({
  nhts: z.string().min(1, "NHTS household is required"),
  sitio: z.string().min(1, "Sitio is required"),
  street: z.string()
    .min(1, "Address is required")
    .min(2, "Address must be at least 2 letters"),
  householdHead: z.string()
});

export const motherHealthInfo = z.object({
  healthRiskClass: z.string().optional(),
  immunizationStatus: z.string().optional(),
  method: z.array(z.string()).optional(), 
  source: z.string().optional(),
  lmpDate: z.string().optional(),
});

export const environmentalFormSchema = z.object({
  waterSupply: z.string().min(1, "Water supply type is required"),
  facilityType: z.string().min(1, "At least one sanitary facility must be selected"),
  sanitaryFacilityType: z.string().optional(),
  unsanitaryFacilityType: z.string().optional(),
  toiletFacilityType: z.string(),
  wasteManagement: z.string().min(1, )

});

export const ncdFormSchema = z.object({
  riskClassAgeGroup: z.string(),
  comorbidities: z.string(),
  lifestyleRisk: z.string(),
  inMaintenance: z.string(),
})
export const tbSurveilanceSchema = z.object({
  srcAntiTBmeds: z.string(),
  noOfDaysTakingMeds: z.string(),
  tbStatus: z.string(),

})

export const familyFormSchema2 = z.object({
  demographicInfo: demographicInfoSchema,
  motherInfo: parentInfoSchema.extend({
    healthRelDetails: perAddDetails.optional(),
    motherHealthInfo: motherHealthInfo.optional(),
  }),
  fatherInfo: parentInfoSchema.extend({
    healthRelDetails: perAddDetails.optional(),
  }),
  guardInfo: parentInfoSchema,
  respondentInfo: personInfoSchema,
  householdHeadInfo: householdHeadSchema,
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
      ncdFormSchema: ncdFormSchema.optional()
    })
  }),
  tbRecords: z.object({
    list: z.array(personInfoSchema.extend({
      tbSurveilanceSchema: tbSurveilanceSchema.optional()
    })).default([]),
    new: personInfoSchema.extend({
      tbSurveilanceSchema: tbSurveilanceSchema.optional()
    })
  }),
});


// export const businessFormSchema = z.object({
//   bus_respondentLname: z.string()
//     .min(1, 'Last Name is required')
//     .min(2, 'Last Name must be atleast 2 letters'),
//   bus_respondentFname: z.string()
//     .min(1, 'First Name is required')
//     .min(2, 'First Name must be atleast 2 letters'),
//   bus_respondentMname: z.string()
//     .refine((val) => val === "" || val.length >= 0, 'Middle Name must be atleast 2 letters')
//     .optional(),
//   bus_respondentSex: z.string().min(1, 'Sex is required'),
//   bus_respondentDob: z.string().min(1, 'Date of Birth is required'),
//   bus_name: z.string().min(1, 'Business Name is required'),
//   bus_gross_sales: z.string().min(1, 'Gross Sales is required'),
//   bus_street: z.string().min(1, 'Street Address is required'),
//   sitio: z.string().min(1, 'Sitio is required')
// });

