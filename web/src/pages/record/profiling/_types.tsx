export type PersonalFormData = {
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

  export type MotherFormData = {
    motherLName: string,
    motherFName: string,
    motherMName: string,
    motherSuffix: string,
    motherDateOfBirth: string,
    motherStatus: string,
    motherReligion: string,
    motherEdAttainment: string,
  }

  export type FatherFormData ={
    fatherLName: string,
    fatherFName: string,
    fatherMName: string,
    fatherSuffix: string,
    fatherDateOfBirth: string,
    fatherStatus: string,
    fatherReligion: string,
    fatherEdAttainment: string,
  }

  export type DependentFormData = {
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
  
  export type FormData = {
    personalInfo: PersonalFormData;
    motherInfo: MotherFormData;
    fatherInfo: FatherFormData;
    dependentInfo: DependentFormData
  }


export type Information = {
    id: string;
    label: string
    value: string
}

export type Dependent = {
    id: string,
    lname: string,
    fname: string,
    mname: string,
    suffix: string,
    dateOfBirth: string,
    maritalStatus: string
}

