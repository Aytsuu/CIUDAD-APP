import * as z from "zod";

export const personalInfoSchema = z.object({
  per_id: z.string(),
  per_lname: z.string().min(1, "Last Name is required"),
  per_fname: z.string().min(1, "First Name is required"),
  per_mname: z.string(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_dob: z.string().date(),
  per_status: z.string().min(1, "Status is required"),
  per_address: z.string().min(1, "Address is required"),
  per_edAttainment: z.string(),
  per_religion: z.string().min(1, "Religion is required"),
  per_contact: z.string().min(1, "Contact is required"),
});

export const healthRelDetails = z.object({
  hrd_bloodType: z.string(),
  hrd_philHealthId: z.string(),
  hrd_covidVaxStatus: z.string(),
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
  father: personalInfoSchema.extend({
    healthRelDetails: healthRelDetails.optional(),
  }),
  mother: personalInfoSchema.extend({
    healthRelDetails: healthRelDetails.optional(),
  }),

  healthRiskClassification: z.string(),
  immunizationStatus: z.string(),
  familyPlanning: z.object({
    method: z.string(),
    source: z.string(),
  }),
  noFamilyPlanning: z.boolean().default(false),
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


  fic: z.string(),
  nutritionalStatus: z.string().min(1, "Nutritional status is required"),
  exclusiveBf: z.string(),
  bloodType: z.string(),
  covidStatus: z.string(),
  philhealthId: z.string(),
});


export const underFiveSchema = dependentDataSchema.extend({
  fic: z.string(),
  nutritionalStatus: z.string().min(1, "Nutritional status is required"),
  exclusiveBf: z.string(),
});

export const overFiveSchema = dependentDataSchema.extend({
  healthRelDetails: healthRelDetails.optional(),
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
  filledBy: z.string().min(1, "Name is required"),
  informant: z.string().min(1, "Informant/Conforme name is required"),
  checkedBy: z.string().min(1, "Checker name is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  signature: z.string().min(1, "Signature is required"),
});

//Improved Schema Structure for Better Reusability and Flexibilit

export const basePersonSchema = z.object ({
  id: z.string(),
  lastName: z.string().min(1, "Last Name is required"),
  firstName: z.string().min(1, "First Name is required"),
  middleName: z.string(),
  suffix: z.string(),
  gender: z.string().min(1, "Gender is required"),
  birthDate: z.string().date("Birth date is required"),
  contactNumber: z.string().min(1, "Contact is required"),
})

export const extendedPersonSchema = basePersonSchema.extend({
  address: z.string().min(1, "Address is required"),
  education: z.string(),
  religion: z.string().min(1, "Religion is required"),
  civilStatus: z.string().min(1, "Civil Status is required"),

})

export const healthDetailsSchema = z.object({
  bloodType: z.string(),
  philHealthId: z.string(),
  covidVaxStatus: z.string(),
})

export const demographicFormSchemaV2 = z.object({
  householdInfo: z.object({
    building: z.string().min(1, "Building is required"),
    quarter: z.string().min(1, "Quarter is required"),
    householdNo: z.string(),
    familyNo: z.string().min(1, "Family No. is required"),
    address: z.string().min(1, "Address is required"),
    nhtsHousehold: z.string(),
    indigenousPeople: z.string(),
  }),
  respondent: basePersonSchema,

  householdHead: basePersonSchema,
  
  parents: z.object({
    father: extendedPersonSchema.extend({
      healthInfo: healthRelDetails.optional(),
    }),
    mother: extendedPersonSchema.extend({
      healthInfo: healthRelDetails.optional(),
    }),
  }),

  householdHealth: z.object({
    riskClassification: z.string(),
    immunizationStatus: z.string(),
    familyPlanning: z.object({
      method: z.string(),
      source: z.string(),
    }).optional(),
    noFamilyPlanning: z.boolean().default(false),
  }),
});