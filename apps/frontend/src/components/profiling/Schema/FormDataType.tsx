export interface PersonalFormData {
    lastName: string;
    firstName: string;
    middleName: string;
    suffix: string;
    sex: string;
    status: string;
    dateOfBirth: string,
    birthPlace: string;
    citizenship: string;
    religion: string;
    contact: string;
  }

  export interface MotherFormData{
    MotherLName: string,
    MotherFName: string,
    MotherMName: string,
    MotherSuffix: string,
    MotherDateOfBirth: string,
    MotherStatus: string,
    MotherReligion: string,
    MotherEdAttainment: string,
  }

  export interface FatherFormData{
    FatherLName: string,
    FatherFName: string,
    FatherMName: string,
    FatherSuffix: string,
    FatherDateOfBirth: string,
    FatherStatus: string,
    FatherReligion: string,
    FatherEdAttainment: string,
  }

  export interface DependentFormData {
    dependentFName: string;
    dependentLName: string;
    dependentMName: string;
    dependentSuffix: string;
    dependentDateOfBirth: string;
    dependentSex: string;
    additionalDependents: {
      dependentFName: string;
      dependentLName: string;
      dependentMName: string;
      dependentSuffix: string;
      dependentDateOfBirth: string;
      dependentSex: string;
    }[];
  }
  
  export interface FormData {
    personalInfo: PersonalFormData;
    motherInfo: MotherFormData;
    fatherInfo: FatherFormData;
    dependentInfo: DependentFormData
  }