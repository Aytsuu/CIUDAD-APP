import * as z from "zod";

const basePersonSchema = z.object({
  id: z.string(),
  lastName: z.string().min(1, "Last Name is required"),
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
});

export const demographicInfo = z.object({
  id: z.string(), 
  building: z.string().min(1, 'Building is required'),
  quarter: z.string().min(1, 'Quarter is required'),
  householdNo: z.string().optional(),
  familyNo: z.string().min(1, 'Family No. is required'),
  indigenous: z.string().min(1, 'Indigenous is required'),
  nhtsHousehold: z.string().min(1, 'NHTS Household is required'),
});

export const respondentSchema = basePersonSchema.extend({
  contactNumber: z.string().min(1, "Contact Number is required"),
});

export const householdHeadSchema = basePersonSchema;

const parentSchema = basePersonSchema.extend({
  dateOfBirth: z.string().date(),
  status: z.string().min(1, "Status is required"),
  religion: z.string().min(1, "Religion is required"),
  edAttainment: z.string().optional(),
  contact: z.string().min(1, "Contact Number is required"),
});

export const additionalDetails = z.object({
  hrd_bloodType: z.string().optional(),
  hrd_philHealthId: z.string().optional(),
  hrd_covidVaxStatus: z.string().optional(),
});

export const healthInfo = z.object({
  healthRiskClassification: z.string().optional(),
  immunizationStatus: z.string().optional(),
  familyPlanning: z.object({
    method: z.string(),
    source: z.string(),
  }).optional(),
  noFamilyPlanning: z.boolean().default(false),
});

export const DemographicSchema = z.object({
  demographicInfo: demographicInfo,
  respondent: respondentSchema,
  householdHead: householdHeadSchema,
  fatherInfo: parentSchema.extend({
    healthRelDetails: additionalDetails.optional(),
  }),
  motherInfo: parentSchema.extend({
    healthRelDetails: additionalDetails.optional(),
  }),
  healthInfo: healthInfo,
});

// Demographic Data Schema
export const demographicFormSchema = z.object({
  building: z.string().min(1, "Building is required"),
  quarter: z.string().min(1, "Quarter is required"),
  householdNo: z.string(),
  familyNo: z.string().min(1, "Family No. is required"),
  respondent: z.object({
    lastName: z.string().min(1, "Last Name is Required"),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string(),
    gender: z.string(),
    contactNumber: z.string(),
    
  }),
  address: z.string().min(1, "Address is required"),
  nhtsHousehold: z.string(),
  indigenousPeople: z.string(),
  householdHead: z.object({
    lastName: z.string().min(1, "Last name is required"),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string(),
    gender: z.string(),
  }),
  // father: personalInfoSchema.extend({
  //   healthRelDetails: healthRelDetails.optional(),
  // }),
  // mother: personalInfoSchema.extend({
  //   healthRelDetails: healthRelDetails.optional(),
  // }),

  healthInfo: z.object({
    healthRiskClassification: z.string(),
    immunizationStatus: z.string(),
    familyPlanning: z.object({
      method: z.string().optional(),
      source: z.string().optional(),
    }).optional(),
    noFamilyPlanning: z.boolean().optional(),
  }),

});

// Dependent Data Schema
export const dependentDataSchema = z.object({
  id: z.string(),
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string(),
  suffix: z.string(),
  gender: z.string().min(1, "Gender is required"),
  birthday: z.string().min(1, "Birthday is required"),
  relationshipToHead: z.string().min(1, "Relationship is required"),

});


export const underFiveSchema = dependentDataSchema.extend({
  fic: z.string().optional(),
  nutritionalStatus: z.string().optional(),
  exclusiveBf: z.string().optional(),
});

export const overFiveSchema = dependentDataSchema.extend({
  healthRelDetails: additionalDetails.optional(),
});

export const dependentsFormSchema = z.object({
  underFiveData: z.array(underFiveSchema),
  overFiveData: z.array(overFiveSchema),
});

// Environmental Form Schema
export const environmentalFormSchema = z.object({
  waterSupply: z.string().min(1, "Water supply type is required"),
  sanitaryFacilities: z
    .array(z.string())
    .min(1, "At least one sanitary facility must be selected"),
  toiletSharing: z.string().min(1, "Toilet sharing information is required"),
  wasteManagement: z
    .array(z.string())
    .min(1, "At least one waste management method must be selected"),
  otherWasteMethod: z.string().optional(),
});

// Non-Communicable Disease Form Schema
export const ncdRecordSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  riskClass: z.string().min(1, "Risk class is required"),
  comorbidities: z.string().min(1, "Comorbidities information is required"),
  lifestyleRisk: z.string().min(1, "Lifestyle risk information is required"),
  maintenance: z.string().min(1, "Maintenance information is required"),
});

export const tbRecordSchema = z.object({
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  tbSource: z.string().min(1, "TB medication source is required"),
  tbDays: z.string().min(1, "Number of days on TB medication is required"),
  tbStatus: z.string().min(1, "TB status is required"),
});

export const nonCommunicableDiseaseFormSchema = z.object({
  records: z.array(ncdRecordSchema),
  tbRecords: z.array(tbRecordSchema),
});

// Survey Identification Form Schema
export const surveyFormSchema = z.object({
  filledBy: z.string().min(1, "Health Staff is required"),
  informant: z.string().min(1, "Informant/Conforme name is required"),
  checkedBy: z.string().min(1, "Health Staff is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  signature: z.string().min(1, "Signature is required"),
});

// //Improved Schema Structure for Better Reusability and Flexibilit

// export const basePersonSchema = z.object ({
//   id: z.string(),
//   lastName: z.string().min(1, "Last Name is required"),
//   firstName: z.string().min(1, "First Name is required"),
//   middleName: z.string(),
//   suffix: z.string(),
//   gender: z.string().min(1, "Gender is required"),
//   birthDate: z.string().date("Birth date is required"),
//   contactNumber: z.string().min(1, "Contact is required"),
// })

// export const extendedPersonSchema = basePersonSchema.extend({
//   address: z.string().min(1, "Address is required"),
//   education: z.string(),
//   religion: z.string().min(1, "Religion is required"),
//   civilStatus: z.string().min(1, "Civil Status is required"),

// })

// export const healthDetailsSchema = z.object({
//   bloodType: z.string(),
//   philHealthId: z.string(),
//   covidVaxStatus: z.string(),
// })

// export const demographicFormSchemaV2 = z.object({
//   householdInfo: z.object({
//     building: z.string().min(1, "Building is required"),
//     quarter: z.string().min(1, "Quarter is required"),
//     householdNo: z.string(),
//     familyNo: z.string().min(1, "Family No. is required"),
//     address: z.string().min(1, "Street Address is required"),
//     sitio: z.string().min(1, "Sitio is required"),
//     nhtsHousehold: z.string(),
//     indigenousPeople: z.string(),
//   }),
//   respondent: basePersonSchema,

//   householdHead: basePersonSchema,
  
//   parents: z.object({
//     father: extendedPersonSchema.extend({
//       healthInfo: healthRelDetails.optional(),
//     }),
//     mother: extendedPersonSchema.extend({
//       healthInfo: healthRelDetails.optional(),
//     }),
//   }),

//   householdHealth: z.object({
//     riskClassification: z.string(),
//     immunizationStatus: z.string(),
//     familyPlanning: z.object({
//       method: z.string(),
//       source: z.string(),
//     }).optional(),
//     noFamilyPlanning: z.boolean().default(false),
//   }),
// });


