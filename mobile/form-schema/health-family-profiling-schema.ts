import { z } from "zod";

// Demographic Info Schema (Step 1)
export const demographicInfoSchema = z.object({
  householdNo: z.string().min(1, "Household is required"),
  building: z.string().min(1, "Building type is required"),
  indigenous: z.string().min(1, "Indigenous status is required"),
});

// Household Head Schema (read-only, auto-populated)
export const householdHeadSchema = z.object({
  per_lname: z.string().optional(),
  per_fname: z.string().optional(),
  per_mname: z.string().optional(),
  per_sex: z.string().optional(),
});

// Health Related Details
export const perAddDetailsSchema = z.object({
  bloodType: z.string().optional(),
  philHealthId: z.string().optional(),
  covidVaxStatus: z.string().optional(),
});

// Mother Health Info
export const motherHealthInfoSchema = z.object({
  healthRiskClass: z.string().optional(),
  immunizationStatus: z.string().optional(),
  method: z.array(z.string()).optional(),
  source: z.string().optional(),
  lmpDate: z.string().optional(),
});

// Parent Info Schema (Step 2)
export const parentInfoSchema = z.object({
  id: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string(),
  status: z.string(),
  religion: z.string(),
  edAttainment: z.string(),
  contact: z.string(),
  perAddDetails: perAddDetailsSchema.optional(),
});

// Dependent Under Five Schema
export const dependentUnderFiveSchema = z.object({
  fic: z.string().optional(),
  nutritionalStatus: z.string().optional(),
  exclusiveBf: z.string().optional(),
});

// Dependent Schema (Step 3)
export const dependentSchema = z.object({
  id: z.string().optional(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  suffix: z.string(),
  dateOfBirth: z.string(),
  sex: z.string(),
  relationshipToHead: z.string().optional(),
  perAddDetails: perAddDetailsSchema.optional(),
  dependentUnderFiveSchema: dependentUnderFiveSchema.optional(),
});

// Environmental Form Schema (Step 4 - Part 1)
export const environmentalFormSchema = z.object({
  waterSupply: z.string().min(1, "Water supply is required"),
  facilityType: z.string().min(1, "Facility type is required"),
  sanitaryFacilityType: z.string().optional(),
  unsanitaryFacilityType: z.string().optional(),
  toiletFacilityType: z.string().min(1, "Toilet facility type is required"),
  wasteManagement: z.string().min(1, "Waste management is required"),
  wasteManagementOthers: z.string().optional(),
});

// NCD Form Schema (Step 4 - Part 2)
export const ncdFormBaseSchema = z.object({
  riskClassAgeGroup: z.string().optional(),
  comorbidities: z.string().optional(),
  comorbiditiesOthers: z.string().optional(),
  lifestyleRisk: z.string().optional(),
  lifestyleRiskOthers: z.string().optional(),
  inMaintenance: z.string().optional(),
});

export const ncdFormSchema = z.object({
  riskClassAgeGroup: z.string().min(1, "Risk class age group is required"),
  comorbidities: z.string().min(1, "Comorbidities is required"),
  comorbiditiesOthers: z.string().optional(),
  lifestyleRisk: z.string().min(1, "Lifestyle risk is required"),
  lifestyleRiskOthers: z.string().optional(),
  inMaintenance: z.string().min(1, "Maintenance status is required"),
});

// TB Surveillance Schema (Step 4 - Part 3)
export const tbSurveilanceBaseSchema = z.object({
  srcAntiTBmeds: z.string().optional(),
  srcAntiTBmedsOthers: z.string().optional(),
  noOfDaysTakingMeds: z.string().optional(),
  tbStatus: z.string().optional(),
});

export const tbSurveilanceSchema = z.object({
  srcAntiTBmeds: z.string().min(1, "Source of anti-TB medication is required"),
  srcAntiTBmedsOthers: z.string().optional(),
  noOfDaysTakingMeds: z.string().min(1, "Number of days is required"),
  tbStatus: z.string().min(1, "TB status is required"),
});

// Person Info (for NCD and TB records)
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

// Survey Form Schema (Step 5)
export const surveyFormSchema = z.object({
  filledBy: z.string().min(1, "Name is required"),
  informant: z.string().min(1, "Informant name is required"),
  checkedBy: z.string().min(1, "Checker name is required"),
  date: z.string().min(1, "Date is required"),
  signature: z.string().min(1, "Signature is required"),
});

// Complete Health Family Profiling Schema
export const healthFamilyProfilingSchema = z.object({
  demographicInfo: demographicInfoSchema,
  householdHead: householdHeadSchema,
  respondentInfo: parentInfoSchema,
  motherInfo: parentInfoSchema.extend({
    motherHealthInfo: motherHealthInfoSchema.optional(),
  }),
  fatherInfo: parentInfoSchema,
  guardInfo: parentInfoSchema,
  dependentsInfo: z.object({
    list: z.array(dependentSchema).default([]),
    new: dependentSchema,
  }),
  environmentalForm: environmentalFormSchema,
  ncdRecords: z.object({
    list: z.array(
      personInfoSchema.extend({
        ncdFormSchema: ncdFormSchema.optional(),
      })
    ).default([]),
    new: personInfoSchema.extend({
      ncdFormSchema: ncdFormBaseSchema.optional(),
    }),
  }),
  tbRecords: z.object({
    list: z.array(
      personInfoSchema.extend({
        tbSurveilanceSchema: tbSurveilanceSchema.optional(),
      })
    ).default([]),
    new: personInfoSchema.extend({
      tbSurveilanceSchema: tbSurveilanceBaseSchema.optional(),
    }),
  }),
  surveyForm: surveyFormSchema,
});

export type HealthFamilyProfilingFormData = z.infer<typeof healthFamilyProfilingSchema>;
export type DemographicInfoData = z.infer<typeof demographicInfoSchema>;
export type ParentInfoData = z.infer<typeof parentInfoSchema>;
export type DependentData = z.infer<typeof dependentSchema>;
export type EnvironmentalFormData = z.infer<typeof environmentalFormSchema>;
export type NCDFormData = z.infer<typeof ncdFormSchema>;
export type TBSurveilanceData = z.infer<typeof tbSurveilanceSchema>;
export type SurveyFormData = z.infer<typeof surveyFormSchema>;
