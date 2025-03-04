import * as z from "zod"

// Demographic Data Schema
export const demographicFormSchema = z.object({
  building: z.string().optional(),
  quarter: z.string().optional(),
  householdNo: z.string().min(1, { message: "Household number is required" }),
  familyNo: z.string().min(1, { message: "Family number is required" }),
  respondent: z.object({
    lastName: z.string().min(1, { message: "Last name is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    gender: z.string().optional(),
    contactNumber: z.string().optional(),
    mothersMaidenName: z.string().optional(),
  }),
  address: z.string().min(1, { message: "Address is required" }),
  nhtsHousehold: z.string().optional(),
  indigenousPeople: z.string().optional(),
  householdHead: z.object({
    lastName: z.string().min(1, { message: "Last name is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    gender: z.string().optional(),
  }),
  father: z.object({
    lastName: z.string().min(1, { message: "Last name is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    birthYear: z.string().optional(),
    age: z.string().optional(),
    civilStatus: z.string().optional(),
    educationalAttainment: z.string().optional(),
    religion: z.string().optional(),
    bloodType: z.string().optional(),
    philHealthId: z.string().optional(),
    covidVaxStatus: z.string().optional(),
  }),
  mother: z.object({
    lastName: z.string().min(1, { message: "Last name is required" }),
    firstName: z.string().min(1, { message: "First name is required" }),
    middleName: z.string().optional(),
    birthYear: z.string().optional(),
    age: z.string().optional(),
    civilStatus: z.string().optional(),
    educationalAttainment: z.string().optional(),
    religion: z.string().optional(),
    bloodType: z.string().optional(),
    philHealthId: z.string().optional(),
    covidVaxStatus: z.string().optional(),
  }),
  healthRiskClassification: z.string().optional(),
  immunizationStatus: z.string().optional(),
  familyPlanning: z.object({
    method: z.string().optional(),
    source: z.string().optional(),
  }),
  noFamilyPlanning: z.boolean().default(false),
})

// Dependent Data Schema
export const dependentDataSchema = z.object({
  lastName: z.string().min(1, { message: "Last name is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  gender: z.string().min(1, { message: "Gender is required" }),
  age: z.string().min(1, { message: "Age is required" }),
  birthday: z.string().min(1, { message: "Birthday is required" }),
  relationshipToHead: z.string().min(1, { message: "Relationship is required" }),
  fic: z.string().optional(),
  nutritionalStatus: z.string().min(1, { message: "Nutritional status is required" }),
  exclusiveBf: z.string().optional(),
  bloodType: z.string().optional(),
  covidStatus: z.string().optional(),
  philhealthId: z.string().optional(),
})

export const dependentsFormSchema = z.object({
  underFiveData: z.array(dependentDataSchema),
  overFiveData: z.array(dependentDataSchema),
})

// Environmental Form Schema
export const environmentalFormSchema = z.object({
  waterSupply: z.string().min(1, { message: "Water supply type is required" }),
  sanitaryFacilities: z.array(z.string()).min(1, { message: "At least one sanitary facility must be selected" }),
  toiletSharing: z.string().min(1, { message: "Toilet sharing information is required" }),
  wasteManagement: z.array(z.string()).min(1, { message: "At least one waste management method must be selected" }),
  otherWasteMethod: z.string().optional(),
})

// Non-Communicable Disease Form Schema
export const ncdRecordSchema = z.object({
  lastName: z.string().min(1, { message: "Last name is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  age: z.string().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  riskClass: z.string().min(1, { message: "Risk class is required" }),
  comorbidities: z.string().min(1, { message: "Comorbidities information is required" }),
  lifestyleRisk: z.string().min(1, { message: "Lifestyle risk information is required" }),
  maintenance: z.string().min(1, { message: "Maintenance information is required" }),
})

export const tbRecordSchema = z.object({
  lastName: z.string().min(1, { message: "Last name is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  age: z.string().min(1, { message: "Age is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  tbSource: z.string().min(1, { message: "TB medication source is required" }),
  tbDays: z.string().min(1, { message: "Number of days on TB medication is required" }),
  tbStatus: z.string().min(1, { message: "TB status is required" }),
})

export const nonCommunicableDiseaseFormSchema = z.object({
  records: z.array(ncdRecordSchema),
  tbRecords: z.array(tbRecordSchema),
})

// Survey Identification Form Schema
export const surveyFormSchema = z.object({
  filledBy: z.string().min(1, { message: "Name is required" }),
  informant: z.string().min(1, { message: "Informant/Conforme name is required" }),
  checkedBy: z.string().min(1, { message: "Checker name is required" }),
  date: z.date({
    required_error: "Date is required",
  }),
  signature: z.string().min(1, { message: "Signature is required" }),
})

