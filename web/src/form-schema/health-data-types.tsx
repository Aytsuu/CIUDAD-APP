export interface DemographicFormData {
  building: string
  quarter: string
  householdNo: string
  familyNo: string
  respondent: {
    lastName: string
    firstName: string
    middleName: string
    gender: string
    contactNumber: string
    mothersMaidenName: string
  }
  address: string
  nhtsHousehold: string
  indigenousPeople: string
  householdHead: {
    lastName: string
    firstName: string
    middleName: string
    gender: string
  }
  father: {
    lastName: string
    firstName: string
    middleName: string
    birthYear: string
    age: string
    civilStatus: string
    educationalAttainment: string
    religion: string
    bloodType: string
    philHealthId: string
    covidVaxStatus: string
  }
  mother: {
    lastName: string
    firstName: string
    middleName: string
    birthYear: string
    age: string
    civilStatus: string
    educationalAttainment: string
    religion: string
    bloodType: string
    philHealthId: string
    covidVaxStatus: string
  }
  healthRiskClassification: string
  immunizationStatus: string
  familyPlanning: {
    method: string
    source: string
  }
  noFamilyPlanning: boolean
}

export interface DependentData {
  lastName: string
  firstName: string
  middleName: string
  gender: string
  age: string
  birthday: string
  relationshipToHead: string
  fic?: string
  nutritionalStatus: string
  exclusiveBf?: string
  bloodType?: string
  covidStatus?: string
  philhealthId?: string
}

export interface DependentsFormData {
  underFiveData: DependentData[]
  overFiveData: DependentData[]
}

export interface EnvironmentalFormData {
  waterSupply: string
  sanitaryFacilities: string[]
  toiletSharing: string
  wasteManagement: string[]
  otherWasteMethod: string
}

export interface NCDRecord {
  lastName: string
  firstName: string
  middleName: string
  age: string
  gender: string
  riskClass: string
  comorbidities: string
  lifestyleRisk: string
  maintenance: string
}

export interface TBRecord {
  lastName: string
  firstName: string
  middleName: string
  age: string
  gender: string
  tbSource: string
  tbDays: string
  tbStatus: string
}

export interface NonCommunicableDiseaseFormData {
  records: NCDRecord[]
  tbRecords: TBRecord[]
}

export interface SurveyFormData {
  filledBy: string
  informant: string
  checkedBy: string
  date: Date | undefined
  signature: string
}

export interface HealthSurveyData {
  demographic: DemographicFormData
  dependents: DependentsFormData
  environmental: EnvironmentalFormData
  nonCommunicableDisease: NonCommunicableDiseaseFormData
  surveyIdentification: SurveyFormData
}

